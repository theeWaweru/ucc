"use client";

import React, { useState } from "react";
import axios from "axios";

// This is a testing page that can be used to verify the prayer request system
// This would be placed at app/admin/testing/prayer/page.tsx

export default function PrayerSystemTester() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testId, setTestId] = useState<string>("");

  // Function to log test results
  const logResult = (testName: string, success: boolean, details: any) => {
    setTestResults((prev) => [
      ...prev,
      {
        testName,
        success,
        details,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    let createdRequestId = "";

    try {
      // Test 1: Create a new prayer request
      await testCreatePrayerRequest().then((id) => {
        createdRequestId = id || "";
        setTestId(createdRequestId);
      });

      // Wait a bit between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test 2: Get all prayer requests
      await testGetAllPrayerRequests();

      // Wait a bit between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test 3: Get a specific prayer request
      if (createdRequestId) {
        await testGetSpecificPrayerRequest(createdRequestId);
      }

      // Wait a bit between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test 4: Update a prayer request
      if (createdRequestId) {
        await testUpdatePrayerRequest(createdRequestId);
      }

      // Wait a bit between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test 5: Get count of prayer requests
      await testGetPrayerRequestCount();
    } catch (error) {
      console.error("Error running tests:", error);
      logResult("Test Suite", false, {
        message: "Test suite failed to complete",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  // Test creating a prayer request
  const testCreatePrayerRequest = async (): Promise<string> => {
    try {
      const testData = {
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        prayerRequest:
          "This is a test prayer request created at " +
          new Date().toISOString(),
        isUrgent: false,
        isAnonymous: false,
      };

      const response = await axios.post("/api/prayer", testData);

      if (response.data.success) {
        logResult("Create Prayer Request", true, {
          message: "Successfully created prayer request",
          id: response.data.data.id,
        });
        return response.data.data.id;
      } else {
        logResult("Create Prayer Request", false, {
          message: "Failed to create prayer request",
          error: response.data.error,
        });
        return "";
      }
    } catch (error) {
      logResult("Create Prayer Request", false, {
        message: "Exception occurred",
        error: error instanceof Error ? error.message : String(error),
      });
      return "";
    }
  };

  // Test creating an anonymous prayer request
  const testCreateAnonymousPrayerRequest = async () => {
    try {
      const testData = {
        name: "Anonymous User",
        email: "anonymous@example.com",
        prayerRequest: "This is an anonymous test prayer request",
        isUrgent: true,
        isAnonymous: true,
      };

      const response = await axios.post("/api/prayer", testData);

      if (response.data.success) {
        logResult("Create Anonymous Prayer Request", true, {
          message: "Successfully created anonymous prayer request",
          id: response.data.data.id,
        });
      } else {
        logResult("Create Anonymous Prayer Request", false, {
          message: "Failed to create anonymous prayer request",
          error: response.data.error,
        });
      }
    } catch (error) {
      logResult("Create Anonymous Prayer Request", false, {
        message: "Exception occurred",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Test getting all prayer requests
  const testGetAllPrayerRequests = async () => {
    try {
      const response = await axios.get("/api/prayer");

      if (response.data.success) {
        logResult("Get All Prayer Requests", true, {
          message: "Successfully retrieved prayer requests",
          count: response.data.data.length,
        });
      } else {
        logResult("Get All Prayer Requests", false, {
          message: "Failed to retrieve prayer requests",
          error: response.data.error,
        });
      }
    } catch (error) {
      logResult("Get All Prayer Requests", false, {
        message: "Exception occurred",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Test getting a specific prayer request
  const testGetSpecificPrayerRequest = async (id: string) => {
    try {
      const response = await axios.get(`/api/prayer/${id}`);

      if (response.data.success) {
        logResult("Get Specific Prayer Request", true, {
          message: "Successfully retrieved prayer request",
          id: id,
          data: response.data.data,
        });
      } else {
        logResult("Get Specific Prayer Request", false, {
          message: "Failed to retrieve prayer request",
          error: response.data.error,
        });
      }
    } catch (error) {
      logResult("Get Specific Prayer Request", false, {
        message: "Exception occurred",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Test updating a prayer request
  const testUpdatePrayerRequest = async (id: string) => {
    try {
      const testData = {
        status: "in-progress",
        adminNotes: "This is a test note added at " + new Date().toISOString(),
      };

      const response = await axios.patch(`/api/prayer/${id}`, testData);

      if (response.data.success) {
        logResult("Update Prayer Request", true, {
          message: "Successfully updated prayer request",
          id: id,
          data: response.data.data,
        });
      } else {
        logResult("Update Prayer Request", false, {
          message: "Failed to update prayer request",
          error: response.data.error,
        });
      }
    } catch (error) {
      logResult("Update Prayer Request", false, {
        message: "Exception occurred",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Test getting count of prayer requests
  const testGetPrayerRequestCount = async () => {
    try {
      const response = await axios.get("/api/prayer?count=true");

      if (response.data.success) {
        logResult("Get Prayer Request Count", true, {
          message: "Successfully retrieved prayer request count",
          count: response.data.count,
        });
      } else {
        logResult("Get Prayer Request Count", false, {
          message: "Failed to retrieve prayer request count",
          error: response.data.error,
        });
      }
    } catch (error) {
      logResult("Get Prayer Request Count", false, {
        message: "Exception occurred",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Test edge case: Submit with missing fields
  const testMissingFields = async () => {
    try {
      // Missing prayer request field
      const testData = {
        name: "Test User",
        email: "test@example.com",
        // No prayer request field
        isUrgent: false,
        isAnonymous: false,
      };

      const response = await axios.post("/api/prayer", testData);

      // This should fail, so success is actually when we get an error
      if (!response.data.success) {
        logResult("Test Missing Fields", true, {
          message: "API correctly rejected request with missing fields",
          error: response.data.error,
        });
      } else {
        logResult("Test Missing Fields", false, {
          message: "API accepted request with missing fields (bug)",
          data: response.data,
        });
      }
    } catch (error) {
      // For axios errors, this is also a success case
      logResult("Test Missing Fields", true, {
        message:
          "API correctly rejected request with missing fields (caught exception)",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Delete a prayer request (for cleanup)
  const testDeletePrayerRequest = async (id: string) => {
    try {
      const response = await axios.delete(`/api/prayer/${id}`);

      if (response.data.success) {
        logResult("Delete Prayer Request", true, {
          message: "Successfully deleted prayer request",
          id: id,
        });
      } else {
        logResult("Delete Prayer Request", false, {
          message: "Failed to delete prayer request",
          error: response.data.error,
        });
      }
    } catch (error) {
      logResult("Delete Prayer Request", false, {
        message: "Exception occurred",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Prayer Request System Tester</h1>

      <div className="space-y-4 mb-8">
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm text-gray-700">
            This tool allows you to test the prayer request API endpoints and
            verify that the system is working correctly. You can run individual
            tests or run all tests sequentially.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={runAllTests}
            disabled={isRunningTests}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isRunningTests ? "Running Tests..." : "Run All Tests"}
          </button>

          <button
            onClick={testCreatePrayerRequest}
            disabled={isRunningTests}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            Test Create Prayer Request
          </button>

          <button
            onClick={testCreateAnonymousPrayerRequest}
            disabled={isRunningTests}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300"
          >
            Test Anonymous Prayer Request
          </button>

          <button
            onClick={testGetAllPrayerRequests}
            disabled={isRunningTests}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            Test Get All Prayer Requests
          </button>

          <button
            onClick={testGetPrayerRequestCount}
            disabled={isRunningTests}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-yellow-300"
          >
            Test Get Count
          </button>

          <button
            onClick={testMissingFields}
            disabled={isRunningTests}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
          >
            Test Missing Fields
          </button>
        </div>

        {testId && (
          <div className="flex flex-wrap gap-2 border-t pt-2">
            <div className="flex items-center text-sm text-gray-600">
              <span>Test ID: {testId}</span>
            </div>
            <button
              onClick={() => testGetSpecificPrayerRequest(testId)}
              disabled={isRunningTests}
              className="px-3 py-1 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-300"
            >
              Test Get
            </button>
            <button
              onClick={() => testUpdatePrayerRequest(testId)}
              disabled={isRunningTests}
              className="px-3 py-1 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-amber-300"
            >
              Test Update
            </button>
            <button
              onClick={() => testDeletePrayerRequest(testId)}
              disabled={isRunningTests}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
            >
              Test Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-100 border-b">
          <h2 className="font-semibold">Test Results</h2>
        </div>

        <div className="divide-y">
          {testResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No tests have been run yet
            </div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        result.success ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <h3 className="font-medium">{result.testName}</h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    {result.timestamp}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {result.details.message}
                </div>

                {result.details.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-2">
                    Error: {result.details.error}
                  </div>
                )}

                {result.details.id && (
                  <div className="text-xs text-gray-500">
                    ID: {result.details.id}
                  </div>
                )}

                {result.details.count !== undefined && (
                  <div className="text-xs text-gray-500">
                    Count: {result.details.count}
                  </div>
                )}

                {result.details.data && (
                  <details className="mt-2">
                    <summary className="text-sm text-blue-600 cursor-pointer">
                      View Data
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(result.details.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
