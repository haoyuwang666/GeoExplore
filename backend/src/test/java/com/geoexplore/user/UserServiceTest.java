package com.geoexplore.user;

import com.geoexplore.place.PlaceRepository;
import com.geoexplore.place.Place;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private AppUserRepository userRepository;
    @Mock private UserCommentRepository commentRepository;
    @Mock private UserTipRepository tipRepository;
    @Mock private PlaceRepository placeRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private UserService userService;

    @Test
    void ownerCanUpdateComment() {
        AppUser owner = mock(AppUser.class);
        UserComment comment = mock(UserComment.class);
        Place place = mock(Place.class);
        when(owner.getId()).thenReturn(7L);
        when(comment.getUser()).thenReturn(owner);
        when(comment.getPlace()).thenReturn(place);
        when(commentRepository.findWithUserAndPlaceById(11L)).thenReturn(Optional.of(comment));

        userService.updateComment(7L, 11L, new CommentRequest("  Updated note  "));

        verify(comment).updateBody("Updated note");
    }

    @Test
    void userCannotUpdateAnotherUsersComment() {
        AppUser owner = mock(AppUser.class);
        UserComment comment = mock(UserComment.class);
        when(owner.getId()).thenReturn(8L);
        when(comment.getUser()).thenReturn(owner);
        when(commentRepository.findWithUserAndPlaceById(11L)).thenReturn(Optional.of(comment));

        assertThatThrownBy(() -> userService.updateComment(7L, 11L, new CommentRequest("Nope")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403 FORBIDDEN");
        verify(comment, never()).updateBody("Nope");
    }

    @Test
    void userCannotDeleteAnotherUsersTip() {
        AppUser owner = mock(AppUser.class);
        UserTip tip = mock(UserTip.class);
        when(owner.getId()).thenReturn(8L);
        when(tip.getUser()).thenReturn(owner);
        when(tipRepository.findWithUserAndPlaceById(21L)).thenReturn(Optional.of(tip));

        assertThatThrownBy(() -> userService.deleteTip(7L, 21L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403 FORBIDDEN");
        verify(tipRepository, never()).delete(tip);
    }

    @Test
    void ownerCanDeleteTip() {
        AppUser owner = mock(AppUser.class);
        UserTip tip = mock(UserTip.class);
        when(owner.getId()).thenReturn(7L);
        when(tip.getUser()).thenReturn(owner);
        when(tipRepository.findWithUserAndPlaceById(21L)).thenReturn(Optional.of(tip));

        userService.deleteTip(7L, 21L);

        verify(tipRepository).delete(tip);
    }
}
