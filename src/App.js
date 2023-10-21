import React,{useState,useEffect} from 'react';
import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';


class Todo {
  constructor(id, title, completed) {
    this.id = id;
    this.title = title;
    this.completed = completed;
  }
}


// function Todolist(){
//   const [todosapi, setTodosApi] = useState([]);
//   useEffect(() => {
//     // 调用API并更新状态
//     fetch("http://api.kero.zone/todos/output")
//     .then(response => response.json())
//     .then(data => setTodosApi(data.items))
//     .catch(error => console.error("Error fetching todos:", error));
//     }, []);
//   console.log(todosapi);
//   return todosapi
// }

function ListItem(props){
  return (
    <InputGroup key = {props.id}>
    <InputGroup.Checkbox checked = {props.completed} onChange={props.updateCompleted}></InputGroup.Checkbox>
    <FormControl value={props.title} style={{ textDecoration: props.completed?'line-through' : "none" }} readOnly></FormControl>
    <Button variant="outline-danger" onClick={props.OnDele}>DELE</Button>
  </InputGroup>
  )
}

function NewItem(props){
  const [input, setinput] = useState("")

  const handleAdd = () => {
    // 检查input是否为空或只包含空格
    if (!input.trim()) {
      alert("未输入内容！");
      return;
    }
    const newTodo = new Todo(Date.now(),input,false);
    props.onAdd(newTodo);
    setinput(""); // 清空输入框
  }

  return (
    <InputGroup>
    <FormControl 
      value={input} 
      onChange={e => setinput(e.target.value)}
      placeholder="输入新的TODO事项"
      onKeyPress={(e) => e.key === 'Enter'&&handleAdd()}       
    ></FormControl>
    <Button onClick={handleAdd}>ADD</Button>
    </InputGroup>
  )
}

function App() {
  const [todo_list, setTodo] = useState([])
  useEffect(() => {
    // 调用API并更新状态
    fetch("https://api.kero.zone/todos/output")
    .then(response => response.json())
    .then(data => setTodo(data.items))
    .catch(error => console.error("Error fetching todos:", error));
    }, []);
  





  useEffect(() => {
    const saveTodosToApi = () => {
      setTodo(currentTodoList => {
      try {
        const response = fetch('https://api.kero.zone/todos/input', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ items: currentTodoList })
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error.message);
      }
      return currentTodoList;
    });
    };
    // 当窗口关闭或刷新时触发的函数
    const handleBeforeUnload = (e) => {
      // 调用你的 saveTodo API
      saveTodosToApi();
    };

    // 添加事件监听器
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 清除事件监听器，防止多次绑定
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);  // 依赖数组为空，确保只在组件挂载和卸载时运行  

  return (
    <div className="App">
      <header className="App-header">              
        <Container>
          {todo_list.map((todo) =>(<ListItem
            key = {todo.id} 
            id = {todo.id}
            title = {todo.title}
            completed = {todo.completed}
            OnDele = {() => 
              setTodo(todo_list.filter(x => x.id !== todo.id))}
            updateCompleted = {() =>
              setTodo(todo_list.map(x => x.id === todo.id ? {...todo,completed: !todo.completed} : x ))
            }
          />))}
          <NewItem
            onAdd = {(newTodo) =>
              setTodo(x => [...x,newTodo])
            }
          />
          <Button variant="outline-danger" onClick={()=>setTodo(todo_list.filter(x => !x.completed))}>dele completed</Button>
        </Container>
      </header>
    </div>
  );
}

export default App;
