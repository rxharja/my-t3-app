import { TodoItem } from "@prisma/client";
import { NextPage } from "next";
import { useRouter } from "next/router";
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

  const complete = async (item: TodoItem) => {
    await setItemCompletion.mutateAsync({
      id: item.id,
      done: !item.done,
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
                <div key={itm.id} onClick={() => complete(itm)}>
                  <Todo item={itm} />
                </div>
              ))
            )
            .exhaustive()}
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
