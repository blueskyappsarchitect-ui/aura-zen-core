import Header from "@/components/Header";
import Timeline from "@/components/Timeline";
import AddTaskButton from "@/components/AddTaskButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header />

      {/* Main scrollable content */}
      <main className="pt-24 pb-32 hide-scrollbar">
        {/* Subtle top gradient */}
        <div className="fixed top-16 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />

        {/* The Aura Timeline */}
        <Timeline />

        {/* Subtle bottom gradient */}
        <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
      </main>

      {/* Floating Add Button */}
      <AddTaskButton />
    </div>
  );
};

export default Index;
