import fs from "fs";
import path from "path";
import cors from "cors";
import express from "express";

import type { Request, Response } from "express";
import type { Alert, RecentCall, PagedResponse } from "../src/api/types";

const app = express();
const port = 3002;

app.use(cors());

/** Example of a local dev server that can serve mock responses for certain APIs */

app.get(
  "/api/Accounts/:account_sid/RecentCalls",
  (req: Request, res: Response) => {
    const call: RecentCall = {
      account_sid: req.params.account_sid,
      call_sid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      from: "string",
      to: "string",
      answered: true,
      sip_call_id: "string",
      sip_status: 0,
      duration: 0,
      attempted_at: 0,
      answered_at: 0,
      terminated_at: 0,
      termination_reason: "string",
      host: "string",
      remote_host: "string",
      direction: "inbound",
      trunk: "string",
    };
    const total = 50;
    /** Simple dumb hack to populate mock data for responses... */
    const data = new Array(total).fill(call, 0, total);

    res.status(200).json(<PagedResponse<RecentCall>>{
      total,
      batch: 0,
      page: 0,
      data,
    });
  }
);

app.get(
  "/api/Accounts/:account_sid/RecentCalls/:call_sid/pcap",
  (req: Request, res: Response) => {
    /** Sample pcap file from: https://wiki.wireshark.org/SampleCaptures#sip-and-rtp */
    const pcap: Buffer = fs.readFileSync(
      path.resolve(process.cwd(), "server", "sample-sip-rtp-traffic.pcap")
    );

    res
      .status(200)
      .set({
        "Content-Type": "application/octet-stream",
        "Content-Disposition": "attachment",
      })
      .send(pcap); // server: Buffer => client: Blob
  }
);

app.get("/api/Accounts/:account_sid/Alerts", (req: Request, res: Response) => {
  const alert: Alert = {
    account_sid: req.params.account_sid,
    time: "2022-08-12T22:52:28.110Z",
    alert_type: "string",
    message: "string",
    detail: "string",
  };
  const total = 50;
  /** Simple dumb hack to populate mock data for responses... */
  const data = new Array(total).fill(alert, 0, total);

  res.status(200).json(<PagedResponse<Alert>>{
    total,
    batch: 0,
    page: 0,
    data,
  });
});

app.listen(port, () => {
  console.log(`express server listening on port ${port}`);
});
