const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  PROFILE: {
    // Ensure we always have a valid string ID
    USER: (id: string | number | undefined) => {
      // If id is undefined or empty, default to the base profile path
      if (!id) return "/profile";
      // Otherwise, return the proper profile path with ID
      return `/profile/${id}`;
    },
  },
  CHAT: {
    HOME: "/chat",
    CONVERSATION: (chatId: string | undefined) => {
      // If chatId is undefined or empty, return to chat home
      if (!chatId) return "/chat";
      // Otherwise, return the proper chat path with ID
      return `/chat/${chatId}`;
    },
  },
};

export default ROUTES;
