const ROUTES = {
  HOME: "/dashboard",
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
};

export default ROUTES;
