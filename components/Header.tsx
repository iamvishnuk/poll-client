"use client";

import Link from "next/link";

import { useState } from "react";
import { Button } from "./ui/button";
import { BarChart3, Plus } from "lucide-react";
import CreatePollForm from "./CreatePollForm";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-blue-600">QuickPoll</h1>
            <p className="text-sm text-muted-foreground">
              Real-time opinion polling
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button variant="outline" className="gap-2 bg-transparent">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
            <Button
              className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setIsOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Poll</span>
            </Button>
          </div>
        </div>
      </div>
      <CreatePollForm isOpen={isOpen} setIsOpen={setIsOpen} />
    </header>
  );
};

export default Header;
