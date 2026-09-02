import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Explore from "./pages/Explore";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;