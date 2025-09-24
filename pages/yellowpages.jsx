// /pages/yellowpages.jsx
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/guthyars',
      permanent: true, // 308
    },
  };
}

export default function YellowpagesRedirect() {
  return null;
}
