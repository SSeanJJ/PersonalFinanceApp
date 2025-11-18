export const mapUserData = (user) => {
  return {
    id: user.uid,
    email: user.email,
    name: user.displayName || "No Name",
    profilePic: user.photoURL || null,
  };
};
