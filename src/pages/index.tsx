import type { NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { TodoList } from "@prisma/client";
import Link from "next/link";

const Home: NextPage = () => {
  const { data } = trpc.todoLists.getAllLists.useQuery();

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
        <div className="flex w-full flex-col items-center justify-center pt-6 text-2xl text-blue-500">
          {data?.map(listInfo)}
        </div>
        <AuthShowcase />
      </main>
    </>
  );
};

const listInfo = (list: TodoList) => (
  <Link key={list.id} href={`lists/${list.id}`}>
    <a>{list.name}</a>
  </Link>
);

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery();

  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {sessionData && (
        <p className="text-2xl text-blue-500">
          Logged in as {sessionData?.user?.name}
        </p>
      )}
      {secretMessage && (
        <p className="text-2xl text-blue-500">{secretMessage}</p>
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
