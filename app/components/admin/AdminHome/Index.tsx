import AnimatedTitle from "../../client/animations/AnimatedTitle";
import SectionDescription from "../../client/animations/SectionDescription";

const Welcome = () => {
  return (
    <div className="h-screen w-full flex justify-center items-center flex-col gap-20">
      <AnimatedTitle
        text="Welcome to the ABM Dashboard"
        className="text-subtitle"
        skipIntroWait
      />
      <SectionDescription
        direction="y"
        text="Use this dashboard to manage and update your website content."
        className="text-description-4 text-description-color"
      />
    </div>
  );
};

export default Welcome;
