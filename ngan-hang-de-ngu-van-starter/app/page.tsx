"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type DeNguVan = {
  id: number;
  tieu_de: string;
  lop: string | null;
  nhom: string | null;
  the_loai: string | null;
  dang_bai: string | null;
  chu_de: string | null;
  ngu_lieu: string | null;
  cau_hoi: string | null;
  dap_an: string | null;
  thoi_gian: number | null;
  so_diem: number | null;
  muc_do: string | null;
  file_url: string | null;
  cong_khai: boolean | null;
};

const THE_LOAI_THO = [
  "Thơ 4 chữ",
  "Thơ 5 chữ",
  "Thơ 6 chữ",
  "Thơ 7 chữ",
  "Thơ 8 chữ",
  "Lục bát",
  "Song thất lục bát",
  "Thơ tự do",
  "Thơ Đường luật",
  "Thơ khác",
];

function taoMauThe(id: number) {
  const mau = [
    "card-pink",
    "card-purple",
    "card-blue",
    "card-peach",
    "card-green",
  ];
  return mau[id % mau.length];
}

export default function Home() {
  const [de, setDe] = useState<DeNguVan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tuKhoa, setTuKhoa] = useState("");
  const [lop, setLop] = useState("Tất cả");
  const [nhom, setNhom] = useState("Tất cả");
  const [theLoai, setTheLoai] = useState("Tất cả");

  const [deDangMo, setDeDangMo] = useState<DeNguVan | null>(null);

  useEffect(() => {
    async function taiDe() {
      setLoading(true);

      const { data, error } = await supabase
        .from("de_ngu_van")
        .select("*")
        .eq("cong_khai", true)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setDe((data ?? []) as DeNguVan[]);
      }

      setLoading(false);
    }

    taiDe();
  }, []);

  useEffect(() => {
    if (deDangMo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [deDangMo]);

  const danhSach = useMemo(() => {
    const q = tuKhoa.trim().toLowerCase();

    return de.filter((item) => {
      const hop =
        `${item.tieu_de ?? ""} ${item.chu_de ?? ""} ${item.ngu_lieu ?? ""} ${item.the_loai ?? ""} ${item.nhom ?? ""}`.toLowerCase();

      return (
        (!q || hop.includes(q)) &&
        (lop === "Tất cả" || item.lop === lop) &&
        (nhom === "Tất cả" || item.nhom === nhom) &&
        (theLoai === "Tất cả" || item.the_loai === theLoai)
      );
    });
  }, [de, tuKhoa, lop, nhom, theLoai]);

  return (
    <main>
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="badge">NGỮ VĂN THCS</div>

            <h1 className="app-title">
              <span className="app-title-main">Ngân hàng đề tự luận</span>
              <span className="app-title-vietnamese">Ngữ văn</span>
            </h1>

            <p className="hero-desc">
              Học liệu được sắp xếp theo lớp, dạng bài và thể loại để học sinh dễ dàng luyện tập.
            </p>
          </div>

          <div className="teacher-box">
            <div className="teacher-avatar">GV</div>
            <div className="teacher-content">
              <div className="teacher-label">GIÁO VIÊN PHỤ TRÁCH</div>
              <div className="teacher-name">TRẦN THỊ NGUYỆT HỒNG</div>
              <div className="teacher-school">
                Giáo viên Ngữ văn - Trường THCS Long Cang, Tây Ninh
              </div>
              <div className="teacher-note">
                Chúc các em học tốt, tự tin và tiến bộ mỗi ngày.
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="stats-wrap">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div>
            <strong>{de.length}</strong>
            <span>Đề đang công khai</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div>
            <strong>6–9</strong>
            <span>Khối THCS</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✍️</div>
          <div>
            <strong>Nhiều dạng</strong>
            <span>Đọc hiểu & viết</span>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="filter-box">
          <div className="filter-title">
            <div className="filter-icon">🔎</div>
            <div>
              <h2>Tìm đề luyện tập</h2>
              <p>Chọn nội dung phù hợp với em</p>
            </div>
          </div>

          <div className="filters">
            <input
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm tên đề, chủ đề, ngữ liệu..."
            />

            <select value={lop} onChange={(e) => setLop(e.target.value)}>
              <option>Tất cả</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
            </select>

            <select value={nhom} onChange={(e) => setNhom(e.target.value)}>
              <option>Tất cả</option>
              <option>Thơ</option>
              <option>Truyện</option>
              <option>Nghị luận xã hội</option>
              <option>Nghị luận văn học</option>
              <option>Viết đoạn văn</option>
              <option>Đề tổng hợp</option>
            </select>

            <select value={theLoai} onChange={(e) => setTheLoai(e.target.value)}>
              <option>Tất cả</option>
              {THE_LOAI_THO.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="summary">
          ✨ Tìm thấy <strong>{danhSach.length}</strong> đề phù hợp
        </div>

        {loading && <div className="notice">Đang tải ngân hàng đề...</div>}

        {error && (
          <div className="notice error">
            Không tải được dữ liệu: {error}
          </div>
        )}

        {!loading && !error && danhSach.length === 0 && (
          <div className="notice">
            Chưa có đề phù hợp với bộ lọc hiện tại.
          </div>
        )}

        <div className="list-view">
          {danhSach.map((item) => (
            <article className={`line-card ${taoMauThe(item.id)}`} key={item.id}>
              <div className="line-card-top">
                <div className="line-badges">
                  <span className="pill">🎓 Lớp {item.lop || "—"}</span>
                  <span className="pill light">
                    📖 {item.the_loai || item.nhom || "Ngữ văn"}
                  </span>
                </div>

                <div className="de-id">Đề {item.id}</div>
              </div>

              <h3 className="line-title">{item.tieu_de}</h3>

              <p className="line-meta">
                ✍️ {item.dang_bai || "Tự luận"}
                {item.so_diem ? ` • ⭐ ${item.so_diem} điểm` : ""}
                {item.thoi_gian ? ` • ⏱ ${item.thoi_gian} phút` : ""}
              </p>

              {item.chu_de && <p className="line-topic">Chủ đề: {item.chu_de}</p>}

              <button className="open-btn" onClick={() => setDeDangMo(item)}>
                Mở đề luyện tập →
              </button>
            </article>
          ))}
        </div>
      </section>

      {deDangMo && (
        <div className="exam-overlay">
          <button className="close-exam" onClick={() => setDeDangMo(null)}>
            Thu gọn đề ▲
          </button>

          <div className="exam-sheet">
            <div className="exam-sheet-top">
              <div>
                <div className="exam-mini-label">ĐỀ LUYỆN TẬP</div>
                <h2>{deDangMo.tieu_de}</h2>
              </div>

              <div className="exam-score">
                {deDangMo.so_diem ? `${deDangMo.so_diem}` : "10"}
                <span>điểm</span>
              </div>
            </div>

            {deDangMo.ngu_lieu && (
              <section className="exam-block">
                <h3>PHẦN I. NGỮ LIỆU</h3>
                <div className="exam-text">{deDangMo.ngu_lieu}</div>
              </section>
            )}

            {deDangMo.cau_hoi && (
              <section className="exam-block">
                <h3>PHẦN II. CÂU HỎI</h3>
                <div className="exam-text">{deDangMo.cau_hoi}</div>
              </section>
            )}

            {!deDangMo.ngu_lieu && !deDangMo.cau_hoi && (
              <section className="exam-block">
                <div className="exam-empty">
                  Đề này chưa được chuẩn hóa nội dung hiển thị.
                </div>
              </section>
            )}

            {deDangMo.file_url && (
              <div className="exam-file-link">
                <a href={deDangMo.file_url} target="_blank" rel="noreferrer">
                  Mở file đính kèm
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="site-footer">
        <div>Ngân hàng đề tự luận Ngữ văn THCS</div>
        <div>Học tập mỗi ngày • Tiến bộ mỗi ngày</div>
        <div className="footer-owner">
          App được tạo bởi GV: TRẦN THỊ NGUYỆT HỒNG - Giáo viên Ngữ văn Trường THCS Long Cang, Tây Ninh. Zalo: 0933122900.
        </div>
      </footer>
    </main>
  );
}
