import { GAMEOVER, MOVE_NUM } from './components/Chessboard/Chessboard';
import './App.css';
import Chessboard from './components/Chessboard/Chessboard';

function App() {
  return (
    <div id="app">
      <h1 className="title">
        ChessMasa Interface
      </h1>
      <Chessboard/>
    </div>
  );
}

export default App;
