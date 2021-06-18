import TextEditor from './TextEditor'
import { v4 as uuidV4} from 'uuid'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/' exact>{/* exact pour etre sur que le router ne mène que au chemin / et pas /k,l,o,,,k, etc */}
          <Redirect to={`/documents/${uuidV4()}`}/>
        </Route>
        <Route path="/documents/:id">
          <TextEditor />
        </Route>
      </Switch>
    </Router>
  )
}

export default App;
