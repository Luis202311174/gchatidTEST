"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="page-container">

      <div className="modal-overlay">
        <div className="modal-content">

          <Card
            title="Pick-up"
            items={[
              { text: "On Gordon College", good: true },
              { text: "On Gordon College Annex", good: true },
              { text: "Outside School Campus", good: false },
            ]}
            btn="Get Rider"
            onClick={() => router.push("/pickup")}
          />

          <Card
            title="Choose Location"
            items={[
              { text: "Near Gordon College", good: true },
              { text: "Near Gordon College Annex", good: true },
              { text: "Far location between campus", good: false },
            ]}
            btn="Open Map for Location"
            onClick={() => router.push("/location")}
          />

          <Card
            title="GC Pahatid"
            items={[
              { text: "Can be carried by motorcycle", good: true },
              { text: "Must not be bigger than a helmet", good: true },
              { text: "Oversized and 5kg Overweight", good: false },
            ]}
            btn="Pahatid Gamit"
            onClick={() => router.push("/pahatid")}
          />
        </div>
      </div>

    </div>
  );
}

type CardItem = {
  text: string;
  good: boolean;
};

type CardProps = {
  title: string;
  items: CardItem[];
  btn: string;
  onClick: () => void;
};

function Card({ title, items, btn, onClick }: CardProps) {
  return (
    <div className="card">
      <div className="card-header">{title}</div>

      <hr className="divider" />

      <ul className="card-list">
        {items.map((item, i) => (
          <li key={i} className="card-item">
            <span className={item.good ? "check" : "cross"}>
              {item.good ? "✓" : "✗"}
            </span>
            {item.text}
          </li>
        ))}
      </ul>

      <button className="card-btn" onClick={onClick}>
        {btn}
      </button>
    </div>
  );
}
