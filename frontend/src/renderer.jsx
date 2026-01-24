import {createRoot} from 'react-dom/client';
import './index.css';

const App = () => {
  return <h1 className='flex items-center justify-center bg-red-600 p-5'>Inital commit</h1>
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App/>)