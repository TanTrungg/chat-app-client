import HashLoader from "react-spinners/HashLoader";

const Loading = () => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <HashLoader size={80} color="#5753e4" />
    </div>
  );
};

export default Loading;
