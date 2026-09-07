import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Navbar from "./components/Navbar";
import Destination from "./pages/Destination";
import YourTrip from "./pages/YourTrip";



function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/destination/:name" element={<Destination />} />
        <Route path="/YourTrip" element={<YourTrip />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App;