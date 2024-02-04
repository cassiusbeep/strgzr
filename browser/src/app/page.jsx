"use client";
import { use, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

export default function Home() {
  const handleConnection = async (e) => {
    // const res = axios.get("http://localhost:3000/api/arduino");

    const data = new TextEncoder().encode("Hello!");
    const port = await navigator.serial.requestPort({
      filters: [{ usbVendorId: 0x2341 }],
    });

    console.log(port.getInfo());
    await port.open({ baudRate: 9600 });

    console.log(await port.getSignals());
    await port.setSignals({ dataTerminalReady: true, requestTosSend: true });

    const writer = port.writable.getWriter();
    await writer.write(data);
    writer.releaseLock();

    await port.forget();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <button
          className="bg-gray-800 text-white p-4 rounded-lg text-lg"
          onClick={handleConnection}
        >
          Sync with Arduino
        </button>
      </div>
    </main>
  );
}
