import type { NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { TodoItem, TodoList } from "@prisma/client";
import Link from "next/link";
import { match, P } from "ts-pattern";
import { useState } from "react";

const Home: NextPage = () => {
  const { data } = trpc.todoLists.getAllLists.useQuery();

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
                {data?.map((l) => (
                  <ListCard key={l.id} list={l} />
                ))}
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

const ListCard = ({ list }: { list: TodoList & { TodoItems: TodoItem[] } }) => {
  const removeList = trpc.todoLists.removeList.useMutation();
  const renameList = trpc.todoLists.renameList.useMutation();
  const { refetch } = trpc.useContext().todoLists.getAllLists;
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(list.name);

  const onRename = async (
    e: React.FormEvent<HTMLFormElement>,
    list: { id: string; name: string }
  ) => {
    e?.preventDefault();
    await renameList.mutateAsync({ id: list.id, name: list.name });
    setEdit(false);
  };

  const onDelete = async (id: string) => {
    await removeList.mutateAsync({ id });
    await refetch();
  };

  return (
    <div className="m-2 block h-48 w-48 max-w-sm rounded-lg bg-white p-6 shadow-lg">
      <div className="flex justify-between">
        {edit ? (
          <form onSubmit={(e) => onRename(e, { id: list.id, name: name })}>
            <input
              className="w-32 border-b-2 border-b-gray-500"
              type="text"
              id="edit-name"
              name="editName"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </form>
        ) : (
          <h5
            className="mb-2 text-xl font-medium leading-tight text-gray-900"
            onClick={() => setEdit(true)}
          >
            {name}
          </h5>
        )}
        <h5
          className="mb-2 cursor-pointer text-xl font-medium leading-tight text-gray-300 hover:text-red-400"
          onClick={() => onDelete(list.id)}
        >
          x
        </h5>
      </div>
      {match(list.TodoItems)
        .with([], () => (
          <>
            <p className="mb-4 text-base text-gray-700">No Items To Do</p>
            <Link key={list.id} href={`lists/${list.id}`}>
              <p className="cursor-pointer">Add More?</p>
            </Link>
          </>
        ))
        .with([P.select()], (itm) => (
          <>
            <p className="mb-4 text-base text-gray-700">
              Last Item: {itm.name}
            </p>
            <Link key={list.id} href={`lists/${list.id}`}>
              <p className="cursor-pointer">View Last Item</p>
            </Link>
          </>
        ))
        .with(P.array({ name: P.string }), ([itm, ..._]) => (
          <>
            <p className="mb-4 text-base text-gray-700">
              Next Item: {itm?.name}
            </p>
            <Link key={list.id} href={`lists/${list.id}`}>
              <p className="cursor-pointer">
                View {list.TodoItems.length} items
              </p>
            </Link>
          </>
        ))
        .exhaustive()}
    </div>
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
