import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Pencil, Sun, Trash } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editTaskIndex, setEditTaskIndex] = useState(null);
  const [filter, setFilter] = useState(null);
  const [sort, setSort] = useState(null);

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef("");
  const taskSummary = useRef("");  
  const taskState = useRef("Not done");
  const taskDeadline = useRef("");

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current.value,
      deadline: taskDeadline.current.value,
    };
    if (editTaskIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editTaskIndex] = newTask;
      setTasks(updatedTasks);
      setEditTaskIndex(null);
    } else {
      setTasks([...tasks, newTask]);
    }
    saveTasks([...tasks, newTask]);
    clearInputs();
  }


  function deleteTask(index) {
    setTasks(tasks.filter((_, i) => i !== index));
    saveTasks(tasks.filter((_, i) => i !== index));
  }

  function editTask(index) {
    const task = tasks[index];
    taskTitle.current.value = task.title;
    taskSummary.current.value = task.summary;
    taskState.current = task.state;
    taskDeadline.current = task.deadline;
    setEditTaskIndex(index);
    setOpened(true);
  }

  function clearInputs() {
    taskTitle.current.value = "";
    taskSummary.current.value = "";
    taskState.current = "Not done";
    taskDeadline.current = "";
    setOpened(false);
  }


  function loadTasks() {
    let loadedTasks = localStorage.getItem("tasks");

    let tasks = JSON.parse(loadedTasks);

    if (tasks) {
      setTasks(tasks);
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sort === "deadline") return new Date(a.deadline) - new Date(b.deadline);
    if (sort === "state") return a.state.localeCompare(b.state);
    if (sort === "done") return a.state === "Done" ? -1 : 1;
    if (sort === "doing") return a.state === "Doing right now" ? -1 : 1;
    if (sort === "not_done") return a.state === "Not done" ? -1 : 1;
    return 0;
  }).filter(task => !filter || task.state === filter);


  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Modal
            opened={opened}
            size={"md"}
            title={editTaskIndex !== null ? "Edit Task" : "New Task"}
            withCloseButton={false}
            onClose={() => {
              setOpened(false);
            }}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              label="State"
              data={["Done", "Not done", "Doing right now"]}
              defaultValue="Not done"
              onChange={(value) => (taskState.current = value)}
              mt={"md"}
            />
            <TextInput
              label="Deadline"
              type="date"
              ref={taskDeadline}
              mt={"md"}
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => {
                  setOpened(false);
                }}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  createTask();
                }}
              >
                {editTaskIndex !== null ? "Save Changes" : "Create Task"}
              </Button>
            </Group>
          </Modal>
          <Container size={550} my={40}>
          <Group>
                <Button onClick={() => setSort("done")}>Show Done First</Button>
                <Button onClick={() => setSort("doing")}>Show Doing First</Button>
                <Button onClick={() => setSort("not_done")}>Show Not Done First</Button>
                <Button onClick={() => setFilter("Done")}>Filter Done</Button>
                <Button onClick={() => setFilter("Doing right now")}>Filter Doing</Button>
                <Button onClick={() => setFilter("Not done")}>Filter Not Done</Button>
                <Button onClick={() => setFilter(null)}>Clear Filter</Button>
              </Group>
            <Group position={"apart"}>
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <MoonStars size={16} />
                )}
              </ActionIcon>
            </Group>
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <Group>
                      <ActionIcon onClick={() => editTask(index)}><Pencil /></ActionIcon>
                      <ActionIcon onClick={() => deleteTask(index)} color={"red"} variant={"transparent"}><Trash /></ActionIcon>
                    </Group>
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>{task.summary || "No summary provided"}</Text>
                  <Text size={"sm"} mt={"xs"}>State: {task.state}</Text>
                  <Text size={"sm"} mt={"xs"}>Deadline: {task.deadline}</Text>
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>You have no tasks</Text>
            )}
            <Button onClick={() => setOpened(true)} fullWidth mt={"md"}>New Task</Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}


