"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useProtectedPage } from "@/lib/useProtectedPage";

const allowedRoles = ["Staff", "Secretariat", "Case Manager"];

export default function PollsPage() {
  const { user, loading, allowed } = useProtectedPage(allowedRoles);
  const [polls, setPolls] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pollForm, setPollForm] = useState({
    question: "",
    options: ["", ""] // Start with 2 empty options
  });

  useEffect(() => {
    if (!allowed) {
      return;
    }

    loadPolls();
  }, [allowed]);

  async function loadPolls() {
    setPageLoading(true);
    setError("");

    try {
      const data = await apiRequest("/polls");
      setPolls(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPageLoading(false);
    }
  }

  async function handleCreatePoll(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    // Filter out empty options
    const validOptions = pollForm.options.filter(option => option.trim() !== "");
    
    if (validOptions.length < 2) {
      setError("Please add at least 2 options.");
      return;
    }

    try {
      await apiRequest("/polls", {
        method: "POST",
        body: JSON.stringify({
          question: pollForm.question,
          options: validOptions
        })
      });

      setMessage("Poll created successfully.");
      setPollForm({
        question: "",
        options: ["", ""]
      });
      loadPolls();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function addOption() {
    setPollForm({
      ...pollForm,
      options: [...pollForm.options, ""]
    });
  }

  function removeOption(index) {
    if (pollForm.options.length > 2) {
      const newOptions = pollForm.options.filter((_, i) => i !== index);
      setPollForm({
        ...pollForm,
        options: newOptions
      });
    }
  }

  function updateOption(index, value) {
    const newOptions = [...pollForm.options];
    newOptions[index] = value;
    setPollForm({
      ...pollForm,
      options: newOptions
    });
  }

  async function handleVote(pollId, optionIndex) {
    setMessage("");
    setError("");

    try {
      await apiRequest("/polls/vote", {
        method: "POST",
        body: JSON.stringify({
          pollId,
          optionIndex
        })
      });

      setMessage("Vote submitted.");
      loadPolls();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) {
    return (
      <AppShell title="Polls" description="Loading polls...">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Checking access...</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (!allowed) {
    return (
      <AppShell title="Polls" description="Only logged-in users can view polls.">
        <Card>
          <CardContent>
            <p className="text-sm text-red-700">You do not have access to this page.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={user}
      title="Polls"
    >
      {(message || error) && (
        <Card className="mb-6">
          <CardContent>
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            {error && <p className="text-sm text-red-700">{error}</p>}
          </CardContent>
        </Card>
      )}

      {(user.role === "Secretariat") && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Poll</CardTitle>
            <CardDescription>Ask a question and add options for people to vote on.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={pollForm.question}
                  onChange={(event) =>
                    setPollForm({
                      ...pollForm,
                      question: event.target.value
                    })
                  }
                  placeholder="What's your question?"
                  required
                />
              </div>

              <div>
                <Label>Options</Label>
                <div className="space-y-3 mt-2">
                  {pollForm.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      {pollForm.options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="px-3"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="w-full"
                  >
                    + Add Option
                  </Button>
                </div>
              </div>

              <Button type="submit">Create Poll</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {pageLoading ? (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Loading polls...</p>
            </CardContent>
          </Card>
        ) : polls.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">No polls available yet.</p>
            </CardContent>
          </Card>
        ) : (
          polls.map((poll) => (
            <Card key={poll._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{poll.question}</CardTitle>
                  <Badge variant="secondary">{poll.totalVotes} votes</Badge>
                </div>
                <CardDescription>
                  By {poll.createdBy.name} • {formatDate(poll.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {poll.options.map((option, index) => {
                    const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                    
                    return (
                      <div key={option.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">{percentage}%</span>
                            {(user.role === "Staff" || user.role === "Case Manager") && !poll.hasVoted ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleVote(poll._id, index)}
                              >
                                Vote
                              </Button>
                            ) : (
                              <span className="text-sm text-slate-500">({option.votes})</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              poll.selectedOption === index ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        
                        {poll.selectedOption === index && (
                          <p className="text-xs text-emerald-600 font-medium">✓ You voted for this</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
