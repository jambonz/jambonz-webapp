import fs from "fs";
import path from "path";
import cors from "cors";
import express from "express";
import { nanoid } from "nanoid";

import type { Request, Response } from "express";
import type {
  Alert,
  RecentCall,
  PageQuery,
  CallQuery,
  PagedResponse,
} from "../src/api/types";

const app = express();
const port = 3002;

app.use(cors());

/** RecentCalls mock API responses for local dev */
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
      const call_sid = nanoid();
      const call: RecentCall = {
        account_sid: req.params.account_sid,
        call_sid,
        from: "15083084809",
        to: "18882349999",
        answered: !failed,
        sip_callid: `${nanoid()}@192.168.1.100`,
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
        trace_id: nanoid(),
        recording_url: `http://127.0.0.1:3002/api/Accounts/${req.params.account_sid}/RecentCalls/${call_sid}/record`,
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

    console.log("RecentCalls: filtered", filtered.length);

    if (query.days) {
      filtered = filtered.filter((call) => {
        return (
          call.attempted_at >=
          new Date(Date.now() - query.days! * 24 * 60 * 60 * 1000).getTime()
        );
      });
    }

    console.log("RecentCalls: filtered", filtered.length);

    if (query.direction) {
      filtered = filtered.filter((call) => {
        return call.direction === query.direction;
      });
    }

    console.log("RecentCalls: filtered", filtered.length);

    if (query.answered) {
      filtered = filtered.filter((call) => {
        return call.answered.toString() === query.answered;
      });
    }

    console.log("RecentCalls: filtered", filtered.length);

    const begin = (query.page - 1) * query.count;
    const end = begin + query.count;
    const paged = filtered.slice(begin, end);

    console.log("RecentCalls: paged", paged.length);
    console.log("---");

    res.status(200).json(<PagedResponse<RecentCall>>{
      page_size: query.count,
      total: filtered.length,
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

app.get(
  "/api/Accounts/:account_sid/RecentCalls/:call_sid/record",
  (req: Request, res: Response) => {
    /** Sample pcap file from: https://wiki.wireshark.org/SampleCaptures#sip-and-rtp */
    const wav: Buffer = fs.readFileSync(
      path.resolve(process.cwd(), "server", "example.wav")
    );

    res
      .status(200)
      .set({
        "Content-Type": "audio/wav",
        "Content-Disposition": "attachment",
      })
      .send(wav); // server: Buffer => client: Blob
  }
);

app.get(
  "/api/Accounts/:account_sid/RecentCalls/trace/:trace_id",
  (req: Request, res: Response) => {
    const json = fs.readFileSync(
      path.resolve(process.cwd(), "server", "sample-jaeger.json"),
      { encoding: "utf8" }
    );
    res.status(200).json(JSON.parse(json));
  }
);

/** Alerts mock API responses for local dev */
app.get("/api/Accounts/:account_sid/Alerts", (req: Request, res: Response) => {
  const data: Alert[] = [];
  const points = 500;
  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const increment = (now.getTime() - start.getTime()) / points;
  const url = "http://foo.bar";
  const vendor = "google";
  const count = 500;

  for (let i = 0; i < 500; i++) {
    const time = new Date(start.getTime() + i * increment);
    const scenario = i % 5;
    let alert_type = "";
    let message = "";

    switch (scenario) {
      case 0:
        alert_type = "webhook-failure";
        message = `${url} returned 404`;
        break;
      case 1:
        alert_type = "webhook-connection-failure";
        message = `failed to connect to ${url}`;
        break;
      case 2:
        alert_type = "no-tts";
        message = `text to speech credentials for ${vendor} have not been provisioned`;
        break;
      case 3:
        alert_type = "no-carrier";
        message = "outbound call failure: no carriers have been provisioned";
        break;
      case 4:
        alert_type = "call-limit";
        message = `you have exceeded your provisioned call limit of ${count}; please consider upgrading your plan`;
        break;
      default:
        break;
    }

    const alert: Alert = {
      account_sid: req.params.account_sid,
      time: time.getTime(),
      alert_type,
      message,
      detail: "",
    };
    data.push(alert);
  }

  const query: PageQuery = {
    ...req.query,
    page: Number(req.query.page),
    count: Number(req.query.count),
  };

  let filtered = data;

  if (query.start) {
    filtered = filtered.filter((call) => {
      return call.time >= new Date(query.start!).getTime();
    });
  }

  console.log("Alerts: filtered", filtered.length);

  if (query.days) {
    filtered = filtered.filter((call) => {
      return (
        call.time >=
        new Date(Date.now() - query.days! * 24 * 60 * 60 * 1000).getTime()
      );
    });
  }

  console.log("Alerts: filtered", filtered.length);

  const begin = (query.page - 1) * query.count;
  const end = begin + query.count;
  const paged = filtered.slice(begin, end);

  console.log("Alerts: paged", paged.length);
  console.log("---");

  res.status(200).json(<PagedResponse<Alert>>{
    page_size: query.count,
    total: filtered.length,
    page: query.page,
    data: paged,
  });
});

app.listen(port, () => {
  console.log(`express server listening on port ${port}`);
});
