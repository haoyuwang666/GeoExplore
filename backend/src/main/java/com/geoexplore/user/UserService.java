package com.geoexplore.user;

import com.geoexplore.place.Place;
import com.geoexplore.place.PlaceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class UserService {

    private final AppUserRepository userRepository;
    private final UserCommentRepository commentRepository;
    private final UserTipRepository tipRepository;
    private final PlaceRepository placeRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            AppUserRepository userRepository,
            UserCommentRepository commentRepository,
            UserTipRepository tipRepository,
            PlaceRepository placeRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.tipRepository = tipRepository;
        this.placeRepository = placeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(AuthRequest request) {
        String displayName = clean(request.displayName());
        String email = normalizeEmail(request.email());
        String password = request.password() == null ? "" : request.password();

        if (displayName.length() < 2 || displayName.length() > 80) {
            throw badRequest("Name must be between 2 and 80 characters");
        }
        if (password.length() < 8 || password.length() > 72) {
            throw badRequest("Password must be between 8 and 72 characters");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        AppUser user = userRepository.save(new AppUser(displayName, email, passwordEncoder.encode(password)));
        return UserResponse.from(user, List.of(), List.of());
    }

    @Transactional(readOnly = true)
    public UserResponse login(AuthRequest request) {
        String email = normalizeEmail(request.email());
        String password = request.password() == null ? "" : request.password();
        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(this::invalidCredentials);

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw invalidCredentials();
        }

        return profile(user.getId());
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(Long userId) {
        return profile(userId);
    }

    @Transactional
    public UserResponse addLike(Long userId, Long placeId) {
        AppUser user = requireUserWithLikes(userId);
        Place place = requirePlace(placeId);
        user.getLikedPlaces().add(place);
        return responseFor(user);
    }

    @Transactional
    public UserResponse removeLike(Long userId, Long placeId) {
        AppUser user = requireUserWithLikes(userId);
        user.getLikedPlaces().removeIf(place -> place.getId().equals(placeId));
        return responseFor(user);
    }

    @Transactional(readOnly = true)
    public List<UserCommentResponse> commentsForPlace(Long placeId) {
        requireExistingPlace(placeId);
        return commentRepository.findByPlaceIdOrderByCreatedAtDesc(placeId).stream()
                .map(UserCommentResponse::from)
                .toList();
    }

    @Transactional
    public UserCommentResponse addComment(Long userId, Long placeId, CommentRequest request) {
        AppUser user = requireUser(userId);
        Place place = requirePlace(placeId);
        UserComment comment = new UserComment(user, place, cleanBody(request.body(), "Comment"));
        return UserCommentResponse.from(commentRepository.saveAndFlush(comment));
    }

    @Transactional
    public UserCommentResponse updateComment(Long userId, Long commentId, CommentRequest request) {
        UserComment comment = commentRepository.findWithUserAndPlaceById(commentId)
                .orElseThrow(() -> notFound("Comment not found"));
        requireOwner(userId, comment.getUser().getId());
        comment.updateBody(cleanBody(request.body(), "Comment"));
        return UserCommentResponse.from(comment);
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        UserComment comment = commentRepository.findWithUserAndPlaceById(commentId)
                .orElseThrow(() -> notFound("Comment not found"));
        requireOwner(userId, comment.getUser().getId());
        commentRepository.delete(comment);
    }

    @Transactional(readOnly = true)
    public List<UserTipResponse> tipsForPlace(Long placeId) {
        requireExistingPlace(placeId);
        return tipRepository.findByPlaceIdOrderByCreatedAtDesc(placeId).stream()
                .map(UserTipResponse::from)
                .toList();
    }

    @Transactional
    public UserTipResponse addTip(Long userId, Long placeId, TipRequest request) {
        AppUser user = requireUser(userId);
        Place place = requirePlace(placeId);
        UserTip tip = new UserTip(user, place, request.category(), cleanBody(request.body(), "Tip"));
        return UserTipResponse.from(tipRepository.saveAndFlush(tip));
    }

    @Transactional
    public UserTipResponse updateTip(Long userId, Long tipId, TipRequest request) {
        UserTip tip = tipRepository.findWithUserAndPlaceById(tipId)
                .orElseThrow(() -> notFound("Tip not found"));
        requireOwner(userId, tip.getUser().getId());
        tip.update(request.category(), cleanBody(request.body(), "Tip"));
        return UserTipResponse.from(tip);
    }

    @Transactional
    public void deleteTip(Long userId, Long tipId) {
        UserTip tip = tipRepository.findWithUserAndPlaceById(tipId)
                .orElseThrow(() -> notFound("Tip not found"));
        requireOwner(userId, tip.getUser().getId());
        tipRepository.delete(tip);
    }

    @Transactional(readOnly = true)
    public UserResponse profile(Long userId) {
        AppUser user = requireUserWithLikes(userId);
        return responseFor(user);
    }

    private UserResponse responseFor(AppUser user) {
        return UserResponse.from(
                user,
                commentRepository.findByUserIdOrderByCreatedAtDesc(user.getId()),
                tipRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
        );
    }

    private AppUser requireUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(this::unauthorized);
    }

    private AppUser requireUserWithLikes(Long userId) {
        return userRepository.findWithLikedPlacesById(userId).orElseThrow(this::unauthorized);
    }

    private Place requirePlace(Long placeId) {
        return placeRepository.findById(placeId)
                .orElseThrow(() -> notFound("Place not found"));
    }

    private void requireExistingPlace(Long placeId) {
        if (!placeRepository.existsById(placeId)) throw notFound("Place not found");
    }

    private void requireOwner(Long currentUserId, Long ownerId) {
        if (!ownerId.equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only change your own content");
        }
    }

    private String cleanBody(String value, String label) {
        String body = clean(value);
        if (body.isEmpty() || body.length() > 500) {
            throw badRequest(label + " must be between 1 and 500 characters");
        }
        return body;
    }

    private String normalizeEmail(String value) {
        return clean(value).toLowerCase(Locale.ROOT);
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect");
    }

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to continue");
    }
}
