"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Brain,
  MessageSquare,
  FileText,
  TrendingUp,
  Zap,
  Send,
  Sparkles,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Insight {
  id: string
  type: "opportunity" | "warning" | "recommendation"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  module: string
  action?: string
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant powered by Google Gemini. I can help you analyze your ERP data, generate reports, and provide business insights. What would you like to know about your business operations?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [reportPrompt, setReportPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [insights, setInsights] = useState<Insight[]>([
    {
      id: "1",
      type: "opportunity",
      title: "Inventory Optimization",
      description:
        "Product SKU-001 has been overstocked by 40% for the past 3 months. Consider reducing next order quantity.",
      priority: "high",
      module: "inventory",
      action: "Adjust reorder levels",
    },
    {
      id: "2",
      type: "warning",
      title: "Low Stock Alert",
      description: "15 products are below minimum stock levels and need immediate reordering.",
      priority: "high",
      module: "inventory",
      action: "Create purchase orders",
    },
    {
      id: "3",
      type: "recommendation",
      title: "Sales Trend Analysis",
      description: "Q4 sales are trending 15% higher than last year. Consider increasing production capacity.",
      priority: "medium",
      module: "sales",
      action: "Review production schedule",
    },
  ])
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      })

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I encountered an error processing your request.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting to the AI service. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!reportPrompt.trim()) return

    setIsGeneratingReport(true)
    try {
      const response = await fetch("/api/ai/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: reportPrompt }),
      })

      const data = await response.json()

      // Add the generated report as a chat message
      const reportMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `📊 **Generated Report**\n\n${data.report}`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, reportMessage])
      setReportPrompt("")
    } catch (error) {
      console.error("Report generation error:", error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error generating the report. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleRefreshInsights = async () => {
    setIsLoadingInsights(true)
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules: ["all"] }),
      })

      const data = await response.json()

      if (data.insights && Array.isArray(data.insights)) {
        const formattedInsights = data.insights.map((insight: any, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          ...insight,
        }))
        setInsights(formattedInsights)
      }
    } catch (error) {
      console.error("Insights refresh error:", error)
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-blue-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "opportunity":
        return "bg-green-50 border-green-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-gray-600">Powered by Google Gemini 2.0 Flash</p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Chat Assistant
              </CardTitle>
              <CardDescription>Ask questions about your business data and get AI-powered insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about your business data..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI-Generated Insights
                    </CardTitle>
                    <CardDescription>Real-time business intelligence and recommendations</CardDescription>
                  </div>
                  <Button onClick={handleRefreshInsights} disabled={isLoadingInsights} variant="outline">
                    {isLoadingInsights ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{insight.title}</h3>
                            <Badge variant={insight.priority === "high" ? "destructive" : "secondary"}>
                              {insight.priority}
                            </Badge>
                            <Badge variant="outline">{insight.module}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                          {insight.action && (
                            <Button size="sm" variant="outline">
                              {insight.action}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                AI Report Generator
              </CardTitle>
              <CardDescription>Generate comprehensive business reports using natural language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe the report you want to generate... (e.g., 'Create a sales performance analysis for Q4 2024 with product breakdown and trends')"
                value={reportPrompt}
                onChange={(e) => setReportPrompt(e.target.value)}
                rows={4}
              />
              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport || !reportPrompt.trim()}
                className="w-full"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>

              <div className="mt-6">
                <h3 className="font-medium mb-3">Sample Report Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Sales Performance Analysis for the last quarter",
                    "Inventory Turnover Report with optimization recommendations",
                    "Production Efficiency Summary with bottleneck analysis",
                    "Customer Behavior Analysis and segmentation",
                    "Financial Performance Overview with key metrics",
                    "Supply Chain Optimization opportunities",
                  ].map((template) => (
                    <Button
                      key={template}
                      variant="outline"
                      className="justify-start text-left h-auto p-3"
                      onClick={() => setReportPrompt(template)}
                    >
                      <div className="text-sm">{template}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Automation Rules
              </CardTitle>
              <CardDescription>Set up intelligent automation for your business processes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Auto Purchase Orders",
                      description: "Automatically generate purchase orders when inventory falls below threshold",
                      status: "Active",
                    },
                    {
                      title: "Smart Pricing",
                      description: "AI-powered dynamic pricing based on market conditions and demand",
                      status: "Inactive",
                    },
                    {
                      title: "Production Optimization",
                      description: "Optimize production schedules based on demand forecasting",
                      status: "Active",
                    },
                    {
                      title: "Anomaly Detection",
                      description: "Detect unusual patterns in sales, inventory, or production data",
                      status: "Active",
                    },
                  ].map((rule, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{rule.title}</h3>
                        <Badge variant={rule.status === "Active" ? "default" : "secondary"}>{rule.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
