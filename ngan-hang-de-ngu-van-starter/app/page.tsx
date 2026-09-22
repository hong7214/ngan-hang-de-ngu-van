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

/* =====================================================
   CHUYỂN CHỮ CÓ DẤU → KHÔNG DẤU
   Dùng để nhận diện các tiêu đề I, II, ĐÁP ÁN...
===================================================== */

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

/* =====================================================
   NHẬN DIỆN DÒNG BẮT ĐẦU PHẦN I
===================================================== */

function laBatDauPhanI(line: string) {
  const s = khongDau(line);

  return (
    /^I[\.\):\-]\s*(PHAN\s*)?(DOC|PHAN)/.test(s) ||
    /^PHAN\s+I[\.\):\-]?\s*(DOC|$)/.test(s)
  );
}

/* =====================================================
   NHẬN DIỆN ĐIỂM KẾT THÚC ĐỀ
===================================================== */

function laMocKetThuc(line: string) {
  const s = khongDau(line);

  return (
    /^(?:-+\s*)?HUONG DAN CHAM/.test(s) ||
    /^(?:-+\s*)?DAP AN/.test(s) ||
    /^(?:-+\s*)?MA TRAN/.test(s) ||
    /^(?:-+\s*)?BANG DAC TA/.test(s) ||
    /^(?:-+\s*)?HET\b/.test(s) ||
    /^PHAN\s+III\b/.test(s) ||
    /^III[\.\):\-]/.test(s)
  );
}

/* =====================================================
   LẤY ĐÚNG PHẦN ĐỀ DÀNH CHO HỌC SINH

   - Ghép ngữ liệu + câu hỏi
   - Bỏ tất cả nội dung trước PHẦN I
   - Giữ PHẦN I và PHẦN II
   - Dừng trước đáp án / HDC / ma trận / hết
===================================================== */

function layNoiDungHocSinh(item: DeNguVan) {
  const raw = `${item.ngu_lieu ?? ""}

${item.cau_hoi ?? ""}`
    .replace(/\r/g, "")
    .trim();

  if (!raw) return "";

  const lines = raw.split("\n");

  /* Tìm vị trí bắt đầu PHẦN I */

  const startIndex = lines.findIndex((line) =>
    laBatDauPhanI(line)
  );

  /*
    Nếu không tìm thấy PHẦN I:
    không hiển thị nội dung để tránh vô tình
    đưa tiêu đề / đáp án cho học sinh.
  */

  if (startIndex === -1) {
    return "";
  }

  const ketQua: string[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];

    /* Dừng trước đáp án, ma trận... */

    if (i > startIndex && laMocKetThuc(line)) {
      break;
    }

    /*
      Loại thêm các dòng "MÃ ĐỀ"
      nếu chúng bị chen giữa nội dung tài liệu.
    */

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

export default function Home() {
  const [de, setDe] = useState<DeNguVan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const danhSach = useMemo(() => {
    const q = tuKhoa
      .trim()
      .toLowerCase();

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
  }, [
    de,
    tuKhoa,
    lop,
    nhom,
    theLoai,
  ]);

  return (
    <main>
      <header className="hero">
        <div className="hero-inner">
          <div>
            <div className="badge">
              NGỮ VĂN THCS
            </div>

            <h1>
              Ngân hàng đề tự luận Ngữ văn
            </h1>

            <p>
              Tìm kiếm, chọn lớp, thể loại
              và mở đề ngay trên một đường
              link duy nhất.
            </p>
          </div>

          <div className="hero-number">
            <strong>
              {de.length}
            </strong>

            <span>
              đề đang công khai
            </span>
          </div>
        </div>
      </header>

      <section className="container">

        <div className="filters">

          <input
            value={tuKhoa}
            onChange={(e) =>
              setTuKhoa(e.target.value)
            }
            placeholder="🔎 Tìm theo tên đề, chủ đề, ngữ liệu..."
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

            <option>
              Thơ
            </option>

            <option>
              Truyện
            </option>

            <option>
              Nghị luận xã hội
            </option>

            <option>
              Nghị luận văn học
            </option>

            <option>
              Viết đoạn văn
            </option>

            <option>
              Đề tổng hợp
            </option>
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

        <div className="summary">
          Tìm thấy{" "}
          <strong>
            {danhSach.length}
          </strong>{" "}
          đề
        </div>

        {loading && (
          <div className="notice">
            Đang tải ngân hàng đề...
          </div>
        )}

        {error && (
          <div className="notice error">
            Không tải được dữ liệu:{" "}
            {error}
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

            return (
              <article
                className="card"
                key={item.id}
              >

                <div className="card-top">

                  <span className="pill">
                    Lớp{" "}
                    {item.lop || "—"}
                  </span>

                  <span className="pill light">
                    {item.the_loai ||
                      item.nhom ||
                      "Ngữ văn"}
                  </span>

                </div>

                <h2>
                  {item.tieu_de}
                </h2>

                <p className="meta">
                  {item.dang_bai ||
                    "Tự luận"}

                  {item.thoi_gian
                    ? ` • ${item.thoi_gian} phút`
                    : ""}

                  {item.so_diem
                    ? ` • ${item.so_diem} điểm`
                    : ""}
                </p>

                {item.chu_de && (
                  <p className="topic">
                    Chủ đề:{" "}
                    {item.chu_de}
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
                    ? "Đóng đề"
                    : "Xem đề"}
                </button>

                {dangMo === item.id && (
                  <div className="detail">

                    {noiDung ? (
                      <>
                        <h3>
                          Đề bài
                        </h3>

                        <p className="pre">
                          {noiDung}
                        </p>
                      </>
                    ) : (
                      <div className="notice">
                        Đề này chưa được
                        chuẩn hóa theo cấu
                        trúc Phần I – Phần II.
                        Giáo viên đang kiểm
                        tra lại.
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
        Ngân hàng đề tự luận
        Ngữ văn THCS
      </footer>

    </main>
  );
}
