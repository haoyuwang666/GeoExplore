package com.geoexplore.user;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;
    private final SecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();

    public UserController(
            UserService userService,
            SecurityContextRepository securityContextRepository
    ) {
        this.userService = userService;
        this.securityContextRepository = securityContextRepository;
    }

    @GetMapping("/auth/csrf")
    public CsrfToken csrf(CsrfToken csrfToken) {
        return csrfToken;
    }

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(
            @Valid @RequestBody AuthRequest requestBody,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        UserResponse user = userService.register(requestBody);
        signIn(user.id(), request, response);
        return user;
    }

    @PostMapping("/auth/login")
    public UserResponse login(
            @Valid @RequestBody AuthRequest requestBody,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        UserResponse user = userService.login(requestBody);
        signIn(user.id(), request, response);
        return user;
    }

    @GetMapping("/users/me")
    public UserResponse currentUser(Authentication authentication) {
        return userService.currentUser(userId(authentication));
    }

    @PutMapping("/users/me/likes/{placeId}")
    public UserResponse addLike(@PathVariable Long placeId, Authentication authentication) {
        return userService.addLike(userId(authentication), placeId);
    }

    @DeleteMapping("/users/me/likes/{placeId}")
    public UserResponse removeLike(@PathVariable Long placeId, Authentication authentication) {
        return userService.removeLike(userId(authentication), placeId);
    }

    @GetMapping("/places/{placeId}/comments")
    public List<UserCommentResponse> comments(@PathVariable Long placeId) {
        return userService.commentsForPlace(placeId);
    }

    @PostMapping("/places/{placeId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public UserCommentResponse addComment(
            @PathVariable Long placeId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication
    ) {
        return userService.addComment(userId(authentication), placeId, request);
    }

    @PatchMapping("/comments/{commentId}")
    public UserCommentResponse updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication
    ) {
        return userService.updateComment(userId(authentication), commentId, request);
    }

    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long commentId, Authentication authentication) {
        userService.deleteComment(userId(authentication), commentId);
    }

    @GetMapping("/places/{placeId}/tips")
    public List<UserTipResponse> tips(@PathVariable Long placeId) {
        return userService.tipsForPlace(placeId);
    }

    @PostMapping("/places/{placeId}/tips")
    @ResponseStatus(HttpStatus.CREATED)
    public UserTipResponse addTip(
            @PathVariable Long placeId,
            @Valid @RequestBody TipRequest request,
            Authentication authentication
    ) {
        return userService.addTip(userId(authentication), placeId, request);
    }

    @PatchMapping("/tips/{tipId}")
    public UserTipResponse updateTip(
            @PathVariable Long tipId,
            @Valid @RequestBody TipRequest request,
            Authentication authentication
    ) {
        return userService.updateTip(userId(authentication), tipId, request);
    }

    @DeleteMapping("/tips/{tipId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTip(@PathVariable Long tipId, Authentication authentication) {
        userService.deleteTip(userId(authentication), tipId);
    }

    private void signIn(Long userId, HttpServletRequest request, HttpServletResponse response) {
        if (request.getSession(false) != null) request.changeSessionId();

        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                userId.toString(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(authentication);
        securityContextHolderStrategy.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }

    private Long userId(Authentication authentication) {
        return Long.valueOf(authentication.getName());
    }
}
