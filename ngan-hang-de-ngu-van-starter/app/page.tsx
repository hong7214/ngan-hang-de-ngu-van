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
];

/*
  CÔ CHỈ CẦN THAY 3 DÒNG NÀY
  bằng thông tin thật của giáo viên.
*/


function khongDau(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

function laBatDauPhanI(line: string) {
  const s = khongDau(line)
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  return (
    /^I\s*[\.\):\-]?\s*PHAN\s+DOC\b/.test(s) ||
    /^I\s*[\.\):\-]?\s*DOC\b/.test(s) ||
    /^PHAN\s+I\s*[\.\):\-]?\s*(PHAN\s+)?DOC\b/.test(s) ||
    /^PHAN\s+DOC\s*[- ]*HIEU\b/.test(s)
  );
}

function laDongBatDauNguLieu(line: string) {
  const s = khongDau(line);

  return (
    /^DOC\s+(VAN BAN|BAI THO|DOAN THO|DOAN TRICH|NGU LIEU)/.test(s) ||
    /^DOC\s+HIEU\b/.test(s)
  );
}

function laMocKetThuc(line: string) {
  const s = khongDau(line)
    .replace(/[–—]/g, "-")
    .trim();

  return (
    /^-*\s*HUONG DAN CHAM/.test(s) ||
    /^-*\s*DAP AN/.test(s) ||
    /^-*\s*GOI Y DAP AN/.test(s) ||
    /^-*\s*DAP AN THAM KHAO/.test(s) ||
    /^-*\s*MA TRAN/.test(s) ||
    /^-*\s*BANG DAC TA/.test(s) ||
    /^-*\s*DAC TA DE/.test(s) ||
    /^-*\s*HET\b/.test(s) ||
    /^PHAN\s+III\b/.test(s) ||
    /^III\s*[\.\):\-]/.test(s)
  );
}

function layNoiDungHocSinh(item: DeNguVan) {
  const raw = `${item.ngu_lieu ?? ""}

${item.cau_hoi ?? ""}`
    .replace(/\r/g, "")
    .trim();

  if (!raw) return "";

  const lines = raw.split("\n");

  let startIndex = lines.findIndex((line) =>
    laBatDauPhanI(line)
  );

  let canThemTieuDePhanI = false;

  if (startIndex === -1) {
    startIndex = lines.findIndex((line) =>
      laDongBatDauNguLieu(line)
    );

    if (startIndex !== -1) {
      canThemTieuDePhanI = true;
    }
  }

  if (startIndex === -1) {
    startIndex = 0;
    canThemTieuDePhanI = true;
  }

  const ketQua: string[] = [];

  if (canThemTieuDePhanI) {
    ketQua.push("I. PHẦN ĐỌC HIỂU");
    ketQua.push("");
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];

    if (i > startIndex && laMocKetThuc(line)) {
      break;
    }

    const dong = khongDau(line);

    if (
      /^MA DE\s*[:\-]/.test(dong) ||
      /^MA DE$/.test(dong)
    ) {
      continue;
    }

    ketQua.push(line);
  }

  return ketQua
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
type SiteSettings = {
  teacher_name: string;
  teacher_school: string;
  teacher_message: string;
  teacher_photo_url: string | null;
};
export default function Home() {
  const [de, setDe] = useState<DeNguVan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [thongTinGV, setThongTinGV] =
  useState<SiteSettings>({
    teacher_name: "Giáo viên Ngữ văn",
    teacher_school: "THCS",
    teacher_message:
      "Chúc các em học tốt và tiến bộ mỗi ngày.",
    teacher_photo_url: null,
  });
  const [tuKhoa, setTuKhoa] = useState("");
  const [lop, setLop] = useState("Tất cả");
  const [nhom, setNhom] = useState("Tất cả");
  const [theLoai, setTheLoai] = useState("Tất cả");
  const [dangMo, setDangMo] =
    useState<number | null>(null);

  useEffect(() => {
    async function taiDe() {
      setLoading(true);

      const { data, error } = await supabase
        .from("de_ngu_van")
        .select("*")
        .eq("cong_khai", true)
        .order("created_at", {
          ascending: false,
        });

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
  async function taiThongTinGV() {
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "teacher_name, teacher_school, teacher_message, teacher_photo_url"
      )
      .eq("id", 1)
      .single();

    if (error) {
      console.error(
        "Không tải được thông tin giáo viên:",
        error.message
      );
      return;
    }

    if (data) {
      setThongTinGV({
        teacher_name:
          data.teacher_name ??
          "Giáo viên Ngữ văn",

        teacher_school:
          data.teacher_school ??
          "THCS",

        teacher_message:
          data.teacher_message ??
          "Chúc các em học tốt và tiến bộ mỗi ngày.",

        teacher_photo_url:
          data.teacher_photo_url ??
          null,
      });
    }
  }

  taiThongTinGV();
}, []);
  const danhSach = useMemo(() => {
    const q = tuKhoa.trim().toLowerCase();

    return de.filter((item) => {
      const hop =
        `${item.tieu_de ?? ""} ` +
        `${item.chu_de ?? ""} ` +
        `${item.ngu_lieu ?? ""} ` +
        `${item.the_loai ?? ""}`;

      return (
        (!q ||
          hop.toLowerCase().includes(q)) &&
        (lop === "Tất cả" ||
          item.lop === lop) &&
        (nhom === "Tất cả" ||
          item.nhom === nhom) &&
        (theLoai === "Tất cả" ||
          item.the_loai === theLoai)
      );
    });
  }, [de, tuKhoa, lop, nhom, theLoai]);

  return (
    <main>

      <header className="hero">
        <div className="hero-decoration hero-decoration-one" />
        <div className="hero-decoration hero-decoration-two" />

        <div className="hero-inner">

          <div className="brand-wrap">

            <div className="brand-logo">
              <svg
                viewBox="0 0 64 64"
                aria-hidden="true"
              >
                <path d="M10 13c9-3 16-1 22 5v36c-6-6-13-8-22-5V13Z" />
                <path d="M54 13c-9-3-16-1-22 5v36c6-6 13-8 22-5V13Z" />
                <path d="M32 18v36" />
              </svg>
            </div>

            <div>
              <div className="badge">
                NGỮ VĂN THCS
              </div>

              <h1 className="app-title">
  <span className="app-title-main">
    Ngân hàng đề tự luận
  </span>

  <span className="app-title-vietnamese">
    Ngữ văn
  </span>
</h1>

              <p className="hero-description">
                Học liệu được sắp xếp theo lớp,
                dạng bài và thể loại để học sinh
                dễ dàng luyện tập.
              </p>
            </div>

          </div>

          <div className="teacher-box">

  {thongTinGV.teacher_photo_url ? (
    <img
      className="teacher-photo"
      src={thongTinGV.teacher_photo_url}
      alt="Ảnh giáo viên phụ trách"
    />
  ) : (
    <div className="teacher-avatar">
      GV
    </div>
  )}

  <div className="teacher-info">

    <small>
      GIÁO VIÊN PHỤ TRÁCH
    </small>

    <strong>
      {thongTinGV.teacher_name}
    </strong>

    <span>
      {thongTinGV.teacher_school}
    </span>

    <p>
      {thongTinGV.teacher_message}
    </p>

  </div>

</div>

        </div>
      </header>

      <section className="container">

        <div className="stats-row">

          <div className="stat-card">
            <span>📚</span>
            <div>
              <strong>{de.length}</strong>
              <small>Đề đang công khai</small>
            </div>
          </div>

          <div className="stat-card">
            <span>🎓</span>
            <div>
              <strong>6–9</strong>
              <small>Khối THCS</small>
            </div>
          </div>

          <div className="stat-card">
            <span>✍️</span>
            <div>
              <strong>Nhiều dạng</strong>
              <small>Đọc hiểu & viết</small>
            </div>
          </div>

        </div>

        <div className="filter-panel">

          <div className="filter-title">
            <div>
              <span className="filter-icon">🔎</span>

              <div>
                <strong>Tìm đề luyện tập</strong>
                <small>
                  Chọn nội dung phù hợp với em
                </small>
              </div>
            </div>
          </div>

          <div className="filters">

            <input
              value={tuKhoa}
              onChange={(e) =>
                setTuKhoa(e.target.value)
              }
              placeholder="Tìm tên đề, chủ đề, ngữ liệu..."
            />

            <select
              value={lop}
              onChange={(e) =>
                setLop(e.target.value)
              }
            >
              <option>Tất cả</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
            </select>

            <select
              value={nhom}
              onChange={(e) =>
                setNhom(e.target.value)
              }
            >
              <option>Tất cả</option>
              <option>Thơ</option>
              <option>Truyện</option>
              <option>Nghị luận xã hội</option>
              <option>Nghị luận văn học</option>
              <option>Viết đoạn văn</option>
              <option>Đề tổng hợp</option>
            </select>

            <select
              value={theLoai}
              onChange={(e) =>
                setTheLoai(e.target.value)
              }
            >
              <option>Tất cả</option>

              {THE_LOAI_THO.map((x) => (
                <option key={x}>
                  {x}
                </option>
              ))}
            </select>

          </div>
        </div>

        <div className="summary">
          <span>✨</span>
          Tìm thấy{" "}
          <strong>
            {danhSach.length}
          </strong>{" "}
          đề phù hợp
        </div>

        {loading && (
          <div className="notice">
            Đang tải ngân hàng đề...
          </div>
        )}

        {error && (
          <div className="notice error">
            Không tải được dữ liệu: {error}
          </div>
        )}

        {!loading &&
          !error &&
          danhSach.length === 0 && (
            <div className="notice">
              Chưa có đề phù hợp với
              bộ lọc hiện tại.
            </div>
          )}

        <div className="grid">

          {danhSach.map((item) => {
            const noiDung =
              layNoiDungHocSinh(item);

            const mau =
              item.id % 8;

            return (
              <article
                className={`card card-color-${mau}`}
                key={item.id}
              >

                <div className="card-accent" />

                <div className="card-number">
                  ĐỀ {String(item.id).padStart(2, "0")}
                </div>

                <div className="card-top">

                  <span className="pill">
                    🎓 Lớp {item.lop || "—"}
                  </span>

                  <span className="pill light">
                    📖{" "}
                    {item.the_loai ||
                      item.nhom ||
                      "Ngữ văn"}
                  </span>

                </div>

                <h2>
                  {item.tieu_de}
                </h2>

                <p className="meta">
                  <span>
                    ✍️ {item.dang_bai || "Tự luận"}
                  </span>

                  {item.thoi_gian && (
                    <span>
                      ⏱ {item.thoi_gian} phút
                    </span>
                  )}

                  {item.so_diem && (
                    <span>
                      ⭐ {item.so_diem} điểm
                    </span>
                  )}
                </p>

                {item.chu_de && (
                  <p className="topic">
                    Chủ đề: {item.chu_de}
                  </p>
                )}

                <button
                  className="primary"
                  onClick={() =>
                    setDangMo(
                      dangMo === item.id
                        ? null
                        : item.id
                    )
                  }
                >
                  {dangMo === item.id
                    ? "Thu gọn đề ▲"
                    : "Mở đề luyện tập →"}
                </button>

                {dangMo === item.id && (
                  <div className="detail">

                    {noiDung ? (
                      <>
                        <div className="detail-heading">
                          <div>
                            <span>
                              ĐỀ LUYỆN TẬP
                            </span>

                            <h3>
                              {item.tieu_de}
                            </h3>
                          </div>

                          <div className="detail-score">
                            {item.so_diem || 10}
                            <small>điểm</small>
                          </div>
                        </div>

                        <div className="exam-content">
                          {noiDung}
                        </div>

                        <div className="exam-note">
                          🌱 Chúc em làm bài
                          bình tĩnh, tự tin và
                          đạt kết quả tốt!
                        </div>
                      </>
                    ) : (
                      <div className="notice">
                        Đề đang được giáo viên
                        kiểm tra lại nội dung.
                      </div>
                    )}

                  </div>
                )}

              </article>
            );
          })}

        </div>

      </section>

      <footer>
        <strong>
          Ngân hàng đề tự luận Ngữ văn THCS
        </strong>

        <span>
          Học tập mỗi ngày • Tiến bộ mỗi ngày
        </span>
      </footer>

    </main>
  );
}
