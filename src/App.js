import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Image from "react-bootstrap/Image";
import ico from "./death.gif";
import Dropdown from "react-bootstrap/Dropdown";
import "./font/p5.ttf";
import "./index.css";

class Todo {
  constructor(id, title, completed, deadline) {
    this.id = id;
    this.title = title;
    this.completed = completed;
    this.deadline = deadline;
  }
}

function ListItem(props) {
  function daysDifference(A) {
    const B = new Date();
    return Math.floor((new Date(A) - B) / (1000 * 60 * 60 * 24));
  }

  const deltaDay = daysDifference(props.deadline);
  const death = (10 - deltaDay) * 10;
  const percentage = 50 + death / 2; // 距离deadline
  const iconPosition = {
    position: "absolute",
    top: "50%",
    left: `${percentage}%`,
    transform: "translate(-50%, -50%) scale(0.06)",
  };
  const itemStyle = {
    position: "relative",
    textDecoration: props.completed ? "line-through" : "none",
    background: "linear-gradient(to right, #FFFFFF, #FF0000 ",
    backgroundImage: props.completed && deltaDay <= 10 ? "" : `url(${ico})`, // 设置背景图片
    backgroundSize: "auto 100%", // 使图片高度与FormControl相同，并保持宽高比
    backgroundRepeat: "no-repeat", // 图片不重复
    backgroundPosition: `${percentage}% center`, // 控制图片位置
    animation: "floatEffect 5s infinite",
  };

  return (
    <InputGroup key={props.id}>
      <InputGroup.Checkbox
        checked={props.completed}
        onChange={props.updateCompleted}
      ></InputGroup.Checkbox>
      <Dropdown>
        <Dropdown.Toggle
          as={FormControl}
          value={props.title}
          style={itemStyle}
          readOnly
        ></Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.ItemText> Deadline:{props.deadline}</Dropdown.ItemText>
          <Dropdown.ItemText> 剩余天数：{deltaDay}天</Dropdown.ItemText>
        </Dropdown.Menu>
      </Dropdown>
      <Button variant="outline-danger" onClick={props.OnDele}>
        DELE
      </Button>
    </InputGroup>
  );
}

function NewItem(props) {
  const today = new Date();
  const [input, setinput] = useState("");
  const [startDate, setStartDate] = useState(null);

  const handleAdd = () => {
    // 检查input是否为空或只包含空格
    if (!input.trim() || !startDate) {
      alert("未输入内容！");
      return;
    }
    const newTodo = new Todo(Date.now(), input, false, startDate);
    props.onAdd(newTodo);
    setinput(""); // 清空输入框
    setStartDate(today);
  };

  return (
    <InputGroup>
      <Dropdown>
        <Dropdown.Toggle
          as={FormControl}
          value={input}
          onChange={(e) => setinput(e.target.value)}
          placeholder="NEW Todo"
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        ></Dropdown.Toggle>
      </Dropdown>
      <FormControl
        type="date"
        selected={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <Button onClick={handleAdd}>Todo </Button>
    </InputGroup>
  );
}

function App() {
  const [todo_list, setTodo] = useState([]);
  useEffect(() => {
    // 调用API并更新状态
    fetch("https://api.kero.zone/todos/output")
      .then((response) => response.json())
      .then((data) => setTodo(data.items))
      .catch((error) => console.error("Error fetching todos:", error));
  }, []);

  useEffect(() => {
    const saveTodosToApi = () => {
      setTodo((currentTodoList) => {
        try {
          console.log(currentTodoList);
          const response = fetch("https://api.kero.zone/todos/input", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items: currentTodoList }),
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        } catch (error) {
          console.error(
            "There was a problem with the fetch operation:",
            error.message
          );
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
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 清除事件监听器，防止多次绑定
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []); // 依赖数组为空，确保只在组件挂载和卸载时运行

  return (
    <div className="App">
      <header className="App-header">
        <Container>
          {todo_list.map((todo) => (
            <ListItem
              key={todo.id}
              id={todo.id}
              title={todo.title}
              completed={todo.completed}
              deadline={todo.deadline}
              OnDele={() => setTodo(todo_list.filter((x) => x.id !== todo.id))}
              updateCompleted={() =>
                setTodo(
                  todo_list.map((x) =>
                    x.id === todo.id
                      ? { ...todo, completed: !todo.completed }
                      : x
                  )
                )
              }
            />
          ))}
          <NewItem onAdd={(newTodo) => setTodo((x) => [...x, newTodo])} />
          <Button
            variant="outline-danger"
            onClick={() => setTodo(todo_list.filter((x) => !x.completed))}
          >
            dele completed
          </Button>
        </Container>
      </header>
    </div>
  );
}

export default App;
