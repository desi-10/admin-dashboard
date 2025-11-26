"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDatabase } from "@/features/database/context/DatabaseContext";
import { useTestConnection } from "@/features/database/hooks/useDatabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  buildConnectionUrl,
  getDefaultCredentials,
  CredentialsFormSchema,
  ConnectionStringFormSchema,
  SQLiteFormSchema,
  type DatabaseType,
  type CredentialsForm,
  type ConnectionStringForm,
  type SQLiteForm,
} from "@/features/database/types/database.types";
import { SiMysql, SiPostgresql, SiMariadb, SiSqlite } from "react-icons/si";
import { FiEdit3, FiFile, FiEye, FiEyeOff } from "react-icons/fi";
import { MdOutlineCheckCircle } from "react-icons/md";

const DATABASE_TYPES = [
  { id: "mysql" as const, name: "MySQL", icon: SiMysql },
  { id: "postgresql" as const, name: "PostgreSQL", icon: SiPostgresql },
  { id: "mariadb" as const, name: "MariaDB", icon: SiMariadb },
  { id: "sqlite" as const, name: "SQLite", icon: SiSqlite },
];

const STEPS = [
  { id: 1, title: "Connect your database" },
  { id: 2, title: "Generate pages" },
  { id: 3, title: "Deploy to production" },
];

export default function GetStartedPage() {
  const router = useRouter();
  const { setDbUrl, refreshTables } = useDatabase();
  const testConnection = useTestConnection();

  const [currentStep, setCurrentStep] = useState(1);
  const [dbType, setDbType] = useState<DatabaseType>("postgresql");
  const [connectionMethod, setConnectionMethod] = useState<
    "credentials" | "file"
  >("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "credentials" | "connection_string"
  >("credentials");

  const credentialsForm = useForm<CredentialsForm>({
    resolver: zodResolver(CredentialsFormSchema),
    defaultValues: getDefaultCredentials("postgresql"),
  });

  const connectionStringForm = useForm<ConnectionStringForm>({
    resolver: zodResolver(ConnectionStringFormSchema),
    defaultValues: { url: "" },
  });

  const sqliteForm = useForm<SQLiteForm>({
    resolver: zodResolver(SQLiteFormSchema),
    defaultValues: { path: "" },
  });

  const handleDbTypeChange = (type: DatabaseType) => {
    setDbType(type);
    credentialsForm.setValue("port", type === "postgresql" ? 5432 : 3306);
  };

  const handleCredentialsSubmit = async (data: CredentialsForm) => {
    const url = buildConnectionUrl(dbType, data);
    await connectWithUrl(url);
  };

  const handleConnectionStringSubmit = async (data: ConnectionStringForm) => {
    await connectWithUrl(data.url);
  };

  const handleSQLiteSubmit = async (data: SQLiteForm) => {
    await connectWithUrl(data.path);
  };

  const connectWithUrl = async (url: string) => {
    const result = await testConnection.mutateAsync(url);

    if (result.success) {
      setDbUrl(url);
      await refreshTables();
      setCurrentStep(2);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Getting started</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 border-b pb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() =>
                  step.id <= currentStep && setCurrentStep(step.id)
                }
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
                disabled={step.id > currentStep}
              >
                {currentStep > step.id ? (
                  <MdOutlineCheckCircle size={18} />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                    {step.id}
                  </span>
                )}
                {step.title}
              </button>
              {index < STEPS.length - 1 && (
                <div className="w-8 h-px bg-border mx-2" />
              )}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <div className="space-y-8">
            <p className="text-muted-foreground">
              Connect your database to instantly generate your admin pages —
              your connection details <strong>stay private and local</strong>.
            </p>

            {/* Step 1: Choose database type */}
            <div className="space-y-3">
              <h3 className="font-medium">1. Choose your database type:</h3>
              <div className="flex gap-2">
                {DATABASE_TYPES.map((db) => (
                  <Button
                    key={db.id}
                    variant={dbType === db.id ? "default" : "outline"}
                    onClick={() => handleDbTypeChange(db.id)}
                    className="gap-2"
                  >
                    <db.icon size={18} />
                    {db.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Step 2: Connection method */}
            <div className="space-y-3">
              <h3 className="font-medium">
                2. How do you want to specify the connection details?
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={
                    connectionMethod === "credentials" ? "default" : "outline"
                  }
                  onClick={() => setConnectionMethod("credentials")}
                  className="gap-2"
                >
                  <FiEdit3 size={16} />
                  Enter credentials
                </Button>
                <Button
                  variant={connectionMethod === "file" ? "default" : "outline"}
                  onClick={() => setConnectionMethod("file")}
                  className="gap-2"
                >
                  <FiFile size={16} />
                  Add file manually
                </Button>
              </div>
            </div>

            {/* Step 3: Connection form */}
            <div className="space-y-3">
              <h3 className="font-medium">3. Connect your database:</h3>
              <Card>
                <CardContent className="pt-6">
                  {dbType === "sqlite" ? (
                    <Form {...sqliteForm}>
                      <form
                        onSubmit={sqliteForm.handleSubmit(handleSQLiteSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={sqliteForm.control}
                          name="path"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Database file path *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="/path/to/database.db"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {testConnection.error && (
                          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                            {testConnection.error.message}
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={testConnection.isPending}
                        >
                          {testConnection.isPending
                            ? "Connecting..."
                            : "Connect"}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <Tabs
                      value={activeTab}
                      onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                    >
                      <TabsList className="mb-4">
                        <TabsTrigger value="credentials">
                          Credentials
                        </TabsTrigger>
                        <TabsTrigger value="connection_string">
                          Connection string
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="credentials">
                        <Form {...credentialsForm}>
                          <form
                            onSubmit={credentialsForm.handleSubmit(
                              handleCredentialsSubmit
                            )}
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={credentialsForm.control}
                                name="host"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Host *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Database Hostname or IP address"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={credentialsForm.control}
                                name="port"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Port</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={credentialsForm.control}
                                name="user"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>User *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Database user"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={credentialsForm.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Password *</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type={
                                            showPassword ? "text" : "password"
                                          }
                                          {...field}
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setShowPassword(!showPassword)
                                          }
                                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                          {showPassword ? (
                                            <FiEyeOff size={16} />
                                          ) : (
                                            <FiEye size={16} />
                                          )}
                                        </button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={credentialsForm.control}
                                name="database"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Database *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Database name"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={credentialsForm.control}
                                name="schema"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Schema</FormLabel>
                                    <FormControl>
                                      <Input placeholder="public" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {testConnection.error && (
                              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                                {testConnection.error.message}
                              </div>
                            )}

                            <Button
                              type="submit"
                              disabled={testConnection.isPending}
                            >
                              {testConnection.isPending
                                ? "Connecting..."
                                : "Connect"}
                            </Button>
                          </form>
                        </Form>
                      </TabsContent>

                      <TabsContent value="connection_string">
                        <Form {...connectionStringForm}>
                          <form
                            onSubmit={connectionStringForm.handleSubmit(
                              handleConnectionStringSubmit
                            )}
                            className="space-y-4"
                          >
                            <FormField
                              control={connectionStringForm.control}
                              name="url"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Connection string *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={
                                        dbType === "postgresql"
                                          ? "postgresql://user:password@host:5432/database"
                                          : "mysql://user:password@host:3306/database"
                                      }
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {testConnection.error && (
                              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                                {testConnection.error.message}
                              </div>
                            )}

                            <Button
                              type="submit"
                              disabled={testConnection.isPending}
                            >
                              {testConnection.isPending
                                ? "Connecting..."
                                : "Connect"}
                            </Button>
                          </form>
                        </Form>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <MdOutlineCheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Connected successfully!
            </h2>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        )}

        {currentStep === 3 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Deploy to production</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        )}
      </div>

      {/* Help sidebar */}
      <div className="w-64 shrink-0">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Need help?</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                📖 Documentation
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                🎬 Video tutorial (3 min)
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                💬 Ask on Discord
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
