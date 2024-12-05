import './App.css';
import Chessboard from './components/Chessboard/Chessboard';
import Menu from './components/Menu/Menu';
import { TILESIZE } from './Constants';

function App() {
  return (
    <div id="app">
      <h1 style={{ textAlign: 'center', fontSize: TILESIZE*3/8, marginBottom: TILESIZE/16, color: "white" }}>
        ChessMasa Interface
      </h1>
      <Menu/>
      <Chessboard/>
    </div>
  );
}

export default App;
