import { TodoItem } from "@prisma/client";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { match, P } from "ts-pattern";
import { trpc } from "../../utils/trpc";

const TodoList: NextPage = () => {
  const id = useRouter().query.id as string;

  const {
    data: todoList,
    refetch,
    isLoading,
  } = trpc.todoLists.getList.useQuery(
    { id },
    {
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const setItemCompletion = trpc.todoLists.updateItemCompletion.useMutation();
  const deleteItem = trpc.todoLists.removeItem.useMutation();

  const complete = async (item: TodoItem) => {
    await setItemCompletion.mutateAsync({
      id: item.id,
      done: !item.done,
    });

    await refetch();
  };

  const onDelete = async (item: TodoItem) => {
    await deleteItem.mutateAsync({
      id: item.id,
    });
    await refetch();
  };

  if (isLoading) return <p>Loading...</p>;
  else
    return (
      <>
        <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
            <span className="text-purple-300">{todoList?.name}</span>
          </h1>
          <div className="flex w-full flex-col items-center justify-center pt-6 text-2xl text-blue-500"></div>
          {match(todoList)
            .with(P.nullish, { TodoItems: [] }, () => <p>No Items</p>)
            .with({ TodoItems: P.select("itms") }, ({ itms }) =>
              itms.map((itm) => (
                <div key={itm.id} className="flex w-48 justify-between">
                  <div onClick={() => complete(itm)}>
                    <Todo item={itm} />
                  </div>
                  <p
                    className="cursor-pointer text-lg text-gray-400 hover:text-red-500"
                    onClick={() => onDelete(itm)}
                  >
                    x
                  </p>
                </div>
              ))
            )
            .exhaustive()}
          <AddItem listId={id} />
        </main>
      </>
    );
};

const Todo: React.FC<{ item: TodoItem }> = ({ item }) => (
  <p className={`text-xl ${item.done ? "line-through" : ""}`}>{item.name}</p>
);

const AddItem = ({ listId }: { listId: string }) => {
  const [name, setName] = useState("");
  const [add, setAdd] = useState(true);
  const addItemMutation = trpc.todoLists.addItem.useMutation();
  const { refetch } = trpc.useContext().todoLists.getList;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdd(true);
    setName("");
    await addItemMutation.mutateAsync({ name, listId });
    await refetch({ id: listId });
  };

  return (
    <>
      {add && (
        <button
          className="m-2 h-12 w-12 rounded-xl bg-purple-300 text-gray-100"
          onClick={() => setAdd(false)}
        >
          +
        </button>
      )}
      {!add && (
        <>
          <form onSubmit={onSubmit}>
            <div className="flex flex-row">
              <input
                className="w-48 border-b-2 border-b-gray-500"
                type="text"
                id="list-name"
                name="listName"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
              <button
                className="hidden rounded-xl bg-purple-100 p-2 text-gray-500"
                type="submit"
              >
                Submit
              </button>
            </div>
          </form>
          <button
            className="m-2 h-12 w-12 rounded-xl bg-purple-300 text-gray-100"
            onClick={() => setAdd(true)}
          >
            -
          </button>
        </>
      )}
    </>
  );
};

export default TodoList;
