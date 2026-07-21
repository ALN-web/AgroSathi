/**
 * services/pythonBridge.service.ts
 *
 * Spawns a Python child process and communicates via stdin/stdout (JSON).
 * This is the bridge between Node.js and the trained sklearn model.
 *
 * Protocol:
 *   Node → Python:  JSON string of features written to stdin
 *   Python → Node:  JSON string of prediction result written to stdout
 *   Errors:         Python writes to stderr; Node captures and re-throws
 *
 * TODO: implement when Python predict script is ready.
 */

import { spawn } from 'child_process';
import path from 'path';
import { config } from '../config';

export const pythonBridgeService = {
  /**
   * Execute a Python prediction script with the given input features.
   * @param scriptName - Filename inside python/scripts/ (e.g. 'predict.py')
   * @param inputPayload - Object serialised to JSON and piped to stdin
   * @returns Parsed JSON output from Python stdout
   */
  runScript: async (scriptName: string, inputPayload: unknown): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(config.python.scriptsPath, scriptName);
      
      const proc = spawn(config.python.executable, [scriptPath]);
      
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          const errorMsg = stderr.trim() || 'Unknown python error';
          console.error(`[PythonBridge] Script ${scriptName} exited with code ${code}: ${errorMsg}`);
          return reject(new Error(errorMsg));
        }

        try {
          // Attempt to parse JSON from stdout
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (err) {
          console.error(`[PythonBridge] Failed to parse JSON from stdout: ${stdout}`);
          reject(new Error('Invalid response from Python script'));
        }
      });
      
      proc.on('error', (err) => {
        console.error(`[PythonBridge] Failed to start python process: ${err.message}`);
        reject(err);
      });

      // Send payload via stdin
      try {
        proc.stdin.write(JSON.stringify(inputPayload));
        proc.stdin.end();
      } catch (err) {
        console.error(`[PythonBridge] Failed to write to python stdin`);
        proc.kill();
        reject(err);
      }
    });
  },
};
