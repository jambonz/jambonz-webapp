import fs from "fs";
import path from "path";
import cors from "cors";
import express from "express";

import type { Request, Response } from "express";
import type {
  Alert,
  RecentCall,
  CallQuery,
  PagedResponse,
} from "../src/api/types";

const app = express();
const port = 3002;

app.use(cors());

/** Example of a local dev server that can serve mock responses for certain APIs */

app.get(
  "/api/Accounts/:account_sid/RecentCalls",
  (req: Request, res: Response) => {
    const data: RecentCall[] = [];
    const points = 500;
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const increment = (now.getTime() - start.getTime()) / points;

    for (let i = 0; i < 500; i++) {
      const attempted_at = new Date(start.getTime() + i * increment);
      const failed = 0 === i % 5;
      const call: RecentCall = {
        account_sid: req.params.account_sid,
        call_sid: "b6f48929-8e86-4d62-ae3b-64fb574d91f6",
        from: "15083084809",
        to: "18882349999",
        answered: !failed,
        sip_callid: "685cd008-0a66-4974-b37a-bdd6d9a3c4aa@192.168.1.100",
        sip_status: 200,
        duration: failed ? 0 : 45,
        attempted_at: attempted_at.getTime(),
        answered_at: attempted_at.getTime() + 3000,
        terminated_at: attempted_at.getTime() + 45000,
        termination_reason: "caller hungup",
        host: "192.168.1.100",
        remote_host: "3.55.24.34",
        direction: 0 === i % 2 ? "inbound" : "outbound",
        trunk: 0 === i % 2 ? "twilio" : "user",
      };
      data.push(call);
    }

    const query: CallQuery = {
      ...req.query,
      page: Number(req.query.page),
      count: Number(req.query.count),
    };

    let filtered = data;

    if (query.start) {
      filtered = filtered.filter((call) => {
        return call.attempted_at >= new Date(query.start!).getTime();
      });
    }

    console.log("filtered", filtered.length);

    if (query.days) {
      filtered = filtered.filter((call) => {
        return (
          call.attempted_at >=
          new Date(Date.now() - query.days! * 24 * 60 * 60 * 1000).getTime()
        );
      });
    }

    console.log("filtered", filtered.length);

    if (query.direction) {
      filtered = filtered.filter((call) => {
        return call.direction === query.direction;
      });
    }

    console.log("filtered", filtered.length);

    if (query.answered) {
      filtered = filtered.filter((call) => {
        return call.answered === query.answered;
      });
    }

    console.log("filtered", filtered.length);

    const begin = (query.page - 1) * query.count;
    const end = begin + query.count;
    const paged = filtered.slice(begin, end);

    console.log("paged", paged.length);
    console.log("---");

    res.status(200).json(<PagedResponse<RecentCall>>{
      total: filtered.length,
      batch: 0,
      page: query.page,
      data: paged,
    });
  }
);

app.get(
  "/api/Accounts/:account_sid/RecentCalls/:call_sid",
  (req: Request, res: Response) => {
    res.status(200).json({ total: Math.random() > 0.5 ? 1 : 0 });
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
  const data = Array(total).fill(alert, 0, total);

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
