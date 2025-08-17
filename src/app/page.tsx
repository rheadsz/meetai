"use client"
import Image from "next/image";

import { useState } from "react";
import {authClient} from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import {Button} from "@/components/ui/button"
export default function Home() {

  const { 
        data: session} = authClient.useSession() 

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword]=useState("");

  const onSubmit = () => {
    authClient.signUp.email({
      email,
      name,
      password
    },
    {
      onError: (ctx) =>{
          console.error("Sign-up error:", ctx.error);
  window.alert(`Error: ${ctx.error.message}`);
      },
      onSuccess: () => {
        window.alert("User created successfully");
      }
    
    });
  }
  const onLogin = () => {
    authClient.signIn.email({
      email,
      password
    },
    {
      onError: (ctx) =>{
          console.error("Sign-in error:", ctx.error);
  window.alert(`Error: ${ctx.error.message}`);
      },
      onSuccess: () => {
        window.alert("User logged in successfully");
      }
    
    });
  }

  if (session){
    return (
      <div className="flex flex-col p-4 gap-y-4">
        
        <p className="text-sm text-gray-500">You are logged in as {session.user.name}</p>
        <Button onClick={()=> authClient.signOut()}>
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-10">
    <div className="p-4 flex flex-col gap-y-4">
      <Input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={onSubmit}>Create User</Button>
    </div>

      <div className="p-4 flex flex-col gap-y-4">
     
      <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={onLogin}>Login</Button>
    </div>

    </div>



  )
 

      
}
