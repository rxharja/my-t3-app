import type { NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { TodoItem, TodoList } from "@prisma/client";
import Link from "next/link";
import { match, P } from "ts-pattern";
import { useState } from "react";

const Home: NextPage = () => {
  const { data, refetch } = trpc.todoLists.getAllLists.useQuery();

  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Todo Lists</title>
        <meta name="description" content="Testing out the thing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
          <span className="text-purple-300">Todo</span> Lists
        </h1>
        <div className="flex w-full flex-col items-center justify-between pt-6 text-2xl text-blue-500">
          {session?.user && (
            <>
              <div className="flex w-full flex-row items-center justify-center">
                {data?.map(ListCard)}
                <AddList />
              </div>
            </>
          )}
          {!session?.user && <p>Please sign in to view your lists</p>}
        </div>
        <AuthShowcase />
      </main>
    </>
  );
};

const ListCard = (list: TodoList & { TodoItems: TodoItem[] }) => {
  return (
    <Link key={list.id} href={`lists/${list.id}`}>
      <div className="m-2 block h-48 w-48 max-w-sm cursor-pointer rounded-lg bg-white p-6 shadow-lg">
        <h5 className="mb-2 text-xl font-medium leading-tight text-gray-900">
          {list.name}
        </h5>
        {match(list.TodoItems)
          .with(P.array({ name: P.string }), ([itm, ..._]) => (
            <>
              <p className="mb-4 text-base text-gray-700">
                Next Item: {itm?.name}
              </p>
              <p>{list.TodoItems.length} items left</p>
            </>
          ))
          .with([P.select()], (itm) => (
            <>
              <p className="mb-4 text-base text-gray-700">
                Last Item: {itm.name}
              </p>
              <p>1 item left</p>
            </>
          ))
          .with([], () => (
            <>
              <p className="mb-4 text-base text-gray-700">No Items To Do</p>
              <p>Add More?</p>
            </>
          ))
          .exhaustive()}
      </div>
    </Link>
  );
};

const AddList = () => {
  const [name, setName] = useState("");
  const [add, setAdd] = useState(true);
  const addListMutation = trpc.todoLists.addList.useMutation();
  const { refetch } = trpc.useContext().todoLists.getAllLists;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdd(true);
    setName("");
    await addListMutation.mutateAsync({ name });
    await refetch();
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
          <div className="m-2 block h-48 w-48 max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <form onSubmit={onSubmit}>
              <label className="text-base text-gray-700" htmlFor="listName">
                List Name:
              </label>
              <input
                className="w-32 border-b-2 border-b-gray-500"
                type="text"
                id="list-name"
                name="listName"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
              <div className="p-4" />
              <button
                className="rounded-xl bg-purple-100 p-2 text-gray-500"
                type="submit"
              >
                Submit
              </button>
            </form>
          </div>
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

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {sessionData && (
        <p className="text-2xl text-blue-500">
          Logged in as {sessionData?.user?.name}
        </p>
      )}
      <button
        className="rounded-md border border-black bg-violet-50 px-4 py-2 text-xl shadow-lg hover:bg-violet-100"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
