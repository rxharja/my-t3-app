import { TodoItem, TodoList } from "@prisma/client";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../../utils/trpc";

type ListWithItems = (TodoList & { TodoItems: TodoItem[] }) | undefined;

const TodoList: NextPage = () => {
  const id = useRouter().query.id as string;

  const hasItems = (list: ListWithItems) =>
    list?.TodoItems != null && list?.TodoItems?.length > 0;

  const [todoList, setTodoList] = useState(
    trpc.todoLists.getList.useQuery({
      id: id,
    }).data
  );

  const setItemCompletion = trpc.todoLists.updateItemCompletion.useMutation();

  const complete = async (item: TodoItem) => {
    const list = (
      await setItemCompletion.mutateAsync({
        id: item.id,
        done: item.done ? false : true,
      })
    )?.TodoList;

    setTodoList(list);
  };

  return (
    <>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
          <span className="text-purple-300">{todoList?.name}</span>
        </h1>
        <div className="flex w-full flex-col items-center justify-center pt-6 text-2xl text-blue-500"></div>
        {hasItems(todoList) ? (
          todoList?.TodoItems.map((itm) => (
            <div key={itm.id} onClick={() => complete(itm)}>
              <Todo item={itm} />
            </div>
          ))
        ) : (
          <p>No Items</p>
        )}
      </main>
    </>
  );
};

const Todo: React.FC<{ item: TodoItem }> = ({ item }) => (
  <p
    id={item.id}
    key={item.id}
    className={`text-xl ${item.done ? "line-through" : ""}`}
  >
    {item.name}
  </p>
);

export default TodoList;
