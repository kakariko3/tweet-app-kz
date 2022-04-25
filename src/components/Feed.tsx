import { auth } from '../firebase';

export const Feed = () => {
  return (
    <div>
      <button onClick={() => auth.signOut()}>Logout</button>
    </div>
  );
};
