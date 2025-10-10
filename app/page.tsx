
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/ModeToggle";

const Page = () => {
  return (
    <div className="container mx-auto p-3">
      <h1>Hello, world!</h1>
      <Button>Click me</Button>
      <ModeToggle/>
    </div>
  );
};
export default Page;
