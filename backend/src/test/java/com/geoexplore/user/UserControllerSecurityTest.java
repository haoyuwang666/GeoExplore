package com.geoexplore.user;

import com.geoexplore.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
class UserControllerSecurityTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private UserService userService;

    @Test
    void currentUserRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void communityWriteRequiresCsrfToken() throws Exception {
        mockMvc.perform(post("/api/v1/places/1/comments")
                        .with(user("7"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"A useful note\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void authenticatedCommunityWriteWithCsrfSucceeds() throws Exception {
        UserCommentResponse response = new UserCommentResponse(
                10L, 1L, "Machu Picchu", 7L, "Ari", "A useful note", null, null
        );
        when(userService.addComment(eq(7L), eq(1L), any(CommentRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/places/1/comments")
                        .with(user("7"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"A useful note\"}"))
                .andExpect(status().isCreated());
    }
}
