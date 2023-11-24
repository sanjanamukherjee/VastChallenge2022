import './App.css';
import DataProvider from './Context';
import MainComponent from './components/Main';

// function App() {
//   return (
//     <div className="App">
//       <DataProvider>
//         <div>
//           <MainComponent/>
//         </div>
//       </DataProvider>
//     </div>
//   );
// }
function App() {
  return (
    <div className="App">
      <DataProvider>
        <div>
              <MainComponent/>
        </div>

      </DataProvider>
      
      
    </div>
  );
}
export default App;
