import { Calculator } from "@/components/Calculator";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Number Bank Calculator | Generate & Calculate</title>
        <meta name="description" content="A unique calculator where you generate numbers before using them. Collect digits and spend them to calculate!" />
      </Helmet>
      <Calculator />
    </>
  );
};

export default Index;
