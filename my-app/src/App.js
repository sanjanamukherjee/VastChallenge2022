import logo from './logo.svg';
import './App.css';
import DataProvider from './Context';
import SocialNetwork from './components/charts/SocialNetwork';

function App() {
  return (
    <div className="App">
      <DataProvider>
        <div>
          Hello
          <SocialNetwork/>
        </div>
      </DataProvider>
    </div>
  );
}

export default App;
