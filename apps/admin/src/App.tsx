import { Navbar } from './components/Navbar';
import { AddMovieForm } from './components/AddMovieForm';

function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-[#DDBD68] selection:text-black">
      <Navbar />
      <main>
        <AddMovieForm />
      </main>
    </div>
  );
}

export default App;
