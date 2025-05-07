
export async function handlePostSignIn(user) {
  const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

  return {
    redirect: isNewUser ? '/network/welcome' : '/network/dashboard',
  };
}
