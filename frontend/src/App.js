import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#0a0a0a",
            color: "#f5f0e8",
            border: "2px solid #ff4500",
            fontFamily: "DM Mono, monospace",
            borderRadius: 0,
          },
        }}
      />
    </div>
  );
}

export default App;
