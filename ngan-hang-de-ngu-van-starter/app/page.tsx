"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

type SiteSettings = {
  teacher_name: string;
  teacher_school: string;
  teacher_message: string;
  teacher_photo_url: string | null;
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

/* ==================================================
   XỬ LÝ NỘI DUNG ĐỀ
   Chỉ lấy phần đề dành cho HS
================================================== */

function khongDau(text: string) {
  return text
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

function laBatDauPhanI(
  line: string
) {
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

function laDongBatDauNguLieu(
  line: string
) {
  const s =
    khongDau(line);

  return (
    /^DOC\s+(VAN BAN|BAI THO|DOAN THO|DOAN TRICH|NGU LIEU)/.test(s) ||
    /^DOC\s+HIEU\b/.test(s)
  );
}

function laMocKetThuc(
  line: string
) {
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

function layNoiDungHocSinh(
  item: DeNguVan
) {
  const raw =
    `${item.ngu_lieu ?? ""}

${item.cau_hoi ?? ""}`
      .replace(/\r/g, "")
      .trim();

  if (!raw) {
    return "";
  }

  const lines =
    raw.split("\n");

  let startIndex =
    lines.findIndex(
      (line) =>
        laBatDauPhanI(
          line
        )
    );

  let canThemTieuDePhanI =
    false;

  if (startIndex === -1) {
    startIndex =
      lines.findIndex(
        (line) =>
          laDongBatDauNguLieu(
            line
          )
      );

    if (startIndex !== -1) {
      canThemTieuDePhanI =
        true;
    }
  }

  if (startIndex === -1) {
    startIndex = 0;
    canThemTieuDePhanI =
      true;
  }

  const ketQua: string[] =
    [];

  if (canThemTieuDePhanI) {
    ketQua.push(
      "I. PHẦN ĐỌC HIỂU"
    );
    ketQua.push("");
  }

  for (
    let i = startIndex;
    i < lines.length;
    i++
  ) {
    const line =
      lines[i];

    if (
      i > startIndex &&
      laMocKetThuc(line)
    ) {
      break;
    }

    const dong =
      khongDau(line);

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
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();
}

/* ==================================================
   TRANG CHÍNH
================================================== */

export default function Home() {
  const [de, setDe] =
    useState<DeNguVan[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [error, setError] =
    useState("");

  const [
    thongTinGV,
    setThongTinGV,
  ] =
    useState<SiteSettings>({
      teacher_name:
        "Giáo viên Ngữ văn",

      teacher_school:
        "THCS",

      teacher_message:
        "Chúc các em học tốt và tiến bộ mỗi ngày.",

      teacher_photo_url:
        null,
    });

  const [
    tuKhoa,
    setTuKhoa,
  ] = useState("");

  const [lop, setLop] =
    useState("Tất cả");

  const [nhom, setNhom] =
    useState("Tất cả");

  const [
    theLoai,
    setTheLoai,
  ] =
    useState("Tất cả");

  const [
    deDuocGiao,
    setDeDuocGiao,
  ] =
    useState<number | null>(
      null
    );

  const [
    deDangMo,
    setDeDangMo,
  ] =
    useState<DeNguVan | null>(
      null
    );

  const [
    coChu,
    setCoChu,
  ] = useState(20);

  /* ==================================================
     ĐỌC ID ĐỀ TỪ LINK ?de=...
  ================================================== */

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const maDe =
      params.get("de");

    if (!maDe) {
      return;
    }

    const id =
      Number(maDe);

    if (
      Number.isInteger(id) &&
      id > 0
    ) {
      setDeDuocGiao(id);
    }
  }, []);

  /* ==================================================
     TẢI ĐỀ
  ================================================== */

  useEffect(() => {
    async function taiDe() {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("de_ngu_van")
        .select("*")
        .eq(
          "cong_khai",
          true
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

      if (error) {
        setError(
          error.message
        );
      } else {
        setDe(
          (data ?? []) as DeNguVan[]
        );
      }

      setLoading(false);
    }

    taiDe();
  }, []);

  /* ==================================================
     LINK GIAO BÀI
     Tự mở đúng đề
  ================================================== */

  useEffect(() => {
    if (
      deDuocGiao === null ||
      de.length === 0
    ) {
      return;
    }

    const timThay =
      de.find(
        (item) =>
          item.id ===
          deDuocGiao
      );

    if (timThay) {
      setDeDangMo(
        timThay
      );
    }
  }, [
    de,
    deDuocGiao,
  ]);

  /* ==================================================
     TẢI THÔNG TIN GV
  ================================================== */

  useEffect(() => {
    async function taiThongTinGV() {
      const {
        data,
        error,
      } = await supabase
        .from(
          "site_settings"
        )
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

  /* ==================================================
     KHÓA TRANG KHI ĐANG ĐỌC ĐỀ
  ================================================== */

  useEffect(() => {
    if (deDangMo) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [deDangMo]);

  /* ==================================================
     LỌC ĐỀ
  ================================================== */

  const danhSach =
    useMemo(() => {
      const q =
        tuKhoa
          .trim()
          .toLowerCase();

      return de.filter(
        (item) => {
          if (
            deDuocGiao !==
              null &&
            item.id !==
              deDuocGiao
          ) {
            return false;
          }

          const hop =
            `${item.tieu_de ?? ""} ` +
            `${item.chu_de ?? ""} ` +
            `${item.ngu_lieu ?? ""} ` +
            `${item.nhom ?? ""} ` +
            `${item.the_loai ?? ""}`;

          return (
            (!q ||
              hop
                .toLowerCase()
                .includes(q)) &&
            (lop ===
              "Tất cả" ||
              item.lop ===
                lop) &&
            (nhom ===
              "Tất cả" ||
              item.nhom ===
                nhom) &&
            (theLoai ===
              "Tất cả" ||
              item.the_loai ===
                theLoai)
          );
        }
      );
    }, [
      de,
      tuKhoa,
      lop,
      nhom,
      theLoai,
      deDuocGiao,
    ]);

  /* ==================================================
     IN ĐỀ
  ================================================== */

  function inDe() {
    window.print();
  }

  /* ==================================================
     LƯU PDF
  ================================================== */

  function luuPDF() {
    window.alert(
      "Trong cửa sổ tiếp theo, cô/cháu chọn Máy in / Destination → Save as PDF hoặc Lưu dưới dạng PDF."
    );

    window.print();
  }

  /* ==================================================
     TĂNG / GIẢM CỠ CHỮ
  ================================================== */

  function tangChu() {
    setCoChu((cu) =>
      Math.min(
        cu + 2,
        32
      )
    );
  }

  function giamChu() {
    setCoChu((cu) =>
      Math.max(
        cu - 2,
        16
      )
    );
  }

  const noiDungDangMo =
    deDangMo
      ? layNoiDungHocSinh(
          deDangMo
        )
      : "";

  return (
    <main>

      {/* ==================================================
          HEADER
      ================================================== */}

      <header
        className="hero"
      >
        <div
          className="hero-decoration hero-decoration-one"
        />

        <div
          className="hero-decoration hero-decoration-two"
        />

        <div
          className="hero-inner"
        >
          <div
            className="brand-wrap"
          >
            <div
              className="brand-logo"
            >
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
              <div
                className="badge"
              >
                NGỮ VĂN THCS
              </div>

              <h1
                className="app-title"
              >
                <span
                  className="app-title-main"
                >
                  Ngân hàng đề tự luận
                </span>

                <span
                  className="app-title-vietnamese"
                >
                  Ngữ văn
                </span>
              </h1>

              <p
                className="hero-description"
              >
                {deDuocGiao !==
                null
                  ? "Đề luyện tập được giáo viên giao cho học sinh."
                  : "Học liệu được sắp xếp theo lớp, dạng bài và thể loại để học sinh dễ dàng luyện tập."}
              </p>
            </div>
          </div>

          {/* THÔNG TIN GV */}

          <div
            className="teacher-box"
          >
            {thongTinGV.teacher_photo_url ? (
              <img
                className="teacher-photo"
                src={
                  thongTinGV.teacher_photo_url
                }
                alt="Ảnh giáo viên phụ trách"
              />
            ) : (
              <div
                className="teacher-avatar"
              >
                GV
              </div>
            )}

            <div
              className="teacher-info"
            >
              <small>
                GIÁO VIÊN PHỤ TRÁCH
              </small>

              <strong>
                {
                  thongTinGV.teacher_name
                }
              </strong>

              <span>
                {
                  thongTinGV.teacher_school
                }
              </span>

              <p>
                {
                  thongTinGV.teacher_message
                }
              </p>
            </div>
          </div>
        </div>
      </header>

      <section
        className="container"
      >

        {/* ==================================================
            THỐNG KÊ
        ================================================== */}

        {deDuocGiao ===
          null && (
          <div
            className="stats-row"
          >
            <div
              className="stat-card"
            >
              <span>
                📚
              </span>

              <div>
                <strong>
                  {de.length}
                </strong>

                <small>
                  Đề đang công khai
                </small>
              </div>
            </div>

            <div
              className="stat-card"
            >
              <span>
                🎓
              </span>

              <div>
                <strong>
                  6–9
                </strong>

                <small>
                  Khối THCS
                </small>
              </div>
            </div>

            <div
              className="stat-card"
            >
              <span>
                ✍️
              </span>

              <div>
                <strong>
                  Nhiều dạng
                </strong>

                <small>
                  Đọc hiểu & viết
                </small>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            BỘ LỌC
        ================================================== */}

        {deDuocGiao ===
          null && (
          <div
            className="filter-panel"
          >
            <div
              className="filter-title"
            >
              <div>
                <span
                  className="filter-icon"
                >
                  🔎
                </span>

                <div>
                  <strong>
                    Tìm đề luyện tập
                  </strong>

                  <small>
                    Chọn nội dung phù hợp với em
                  </small>
                </div>
              </div>
            </div>

            <div
              className="filters"
            >
              <input
                value={
                  tuKhoa
                }
                onChange={(
                  e
                ) =>
                  setTuKhoa(
                    e.target.value
                  )
                }
                placeholder="Tìm tên đề, chủ đề, ngữ liệu..."
              />

              <select
                value={lop}
                onChange={(
                  e
                ) =>
                  setLop(
                    e.target.value
                  )
                }
              >
                <option>
                  Tất cả
                </option>
                <option>
                  6
                </option>
                <option>
                  7
                </option>
                <option>
                  8
                </option>
                <option>
                  9
                </option>
              </select>

              <select
                value={nhom}
                onChange={(
                  e
                ) =>
                  setNhom(
                    e.target.value
                  )
                }
              >
                <option>
                  Tất cả
                </option>
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
                value={
                  theLoai
                }
                onChange={(
                  e
                ) =>
                  setTheLoai(
                    e.target.value
                  )
                }
              >
                <option>
                  Tất cả
                </option>

                {THE_LOAI_THO.map(
                  (x) => (
                    <option
                      key={x}
                    >
                      {x}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        )}

        {/* ==================================================
            KẾT QUẢ
        ================================================== */}

        {!loading &&
          !error &&
          deDuocGiao ===
            null && (
            <div
              className="summary"
            >
              ✨ Tìm thấy{" "}
              <strong>
                {
                  danhSach.length
                }
              </strong>{" "}
              đề phù hợp
            </div>
          )}

        {loading && (
          <div
            className="notice"
          >
            Đang tải ngân hàng đề...
          </div>
        )}

        {error && (
          <div
            className="notice error"
          >
            Không tải được dữ liệu:{" "}
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          danhSach.length ===
            0 && (
            <div
              className="notice"
            >
              Không tìm thấy đề phù hợp hoặc đề chưa được công khai.
            </div>
          )}

        {/* ==================================================
            DANH SÁCH ĐỀ - 1 ĐỀ / 1 DÒNG
        ================================================== */}

        <div
          className="exam-list-v2"
        >
          {danhSach.map(
            (item) => {
              const mau =
                item.id % 8;

              return (
                <article
                  key={
                    item.id
                  }
                  className={`exam-row-v2 card-color-${mau}`}
                >
                  <div
                    className="exam-row-accent"
                  />

                  <div
                    className="exam-row-head"
                  >
                    <div
                      className="exam-row-badges"
                    >
                      <span
                        className="pill"
                      >
                        🎓 Lớp{" "}
                        {item.lop ||
                          "—"}
                      </span>

                      <span
                        className="pill light"
                      >
                        📖{" "}
                        {item.the_loai ||
                          item.nhom ||
                          "Ngữ văn"}
                      </span>
                    </div>

                    <strong
                      className="exam-row-id"
                    >
                      ĐỀ{" "}
                      {String(
                        item.id
                      ).padStart(
                        2,
                        "0"
                      )}
                    </strong>
                  </div>

                  <div
                    className="exam-row-body"
                  >
                    <div
                      className="exam-row-info"
                    >
                      <h2>
                        {
                          item.tieu_de
                        }
                      </h2>

                      <div
                        className="exam-row-meta"
                      >
                        <span>
                          ✍️{" "}
                          {item.dang_bai ||
                            "Tự luận"}
                        </span>

                        {item.thoi_gian && (
                          <span>
                            ⏱{" "}
                            {
                              item.thoi_gian
                            }{" "}
                            phút
                          </span>
                        )}

                        {item.so_diem && (
                          <span>
                            ⭐{" "}
                            {
                              item.so_diem
                            }{" "}
                            điểm
                          </span>
                        )}
                      </div>

                      {item.chu_de && (
                        <p
                          className="exam-row-topic"
                        >
                          Chủ đề:{" "}
                          {
                            item.chu_de
                          }
                        </p>
                      )}
                    </div>

                    <button
                      className="exam-open-v2"
                      onClick={() => {
                        setCoChu(
                          20
                        );

                        setDeDangMo(
                          item
                        );
                      }}
                    >
                      Mở toàn màn hình →
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>

      </section>

      {/* ==================================================
          MỞ ĐỀ TOÀN MÀN HÌNH
      ================================================== */}

      {deDangMo && (
        <div
          className="exam-overlay-v2"
        >

          {/* THANH CÔNG CỤ */}

          <div
            className="exam-toolbar-v2"
          >
            <button
              onClick={
                giamChu
              }
              title="Giảm cỡ chữ"
            >
              A−
            </button>

            <span
              className="font-size-label"
            >
              {coChu}px
            </span>

            <button
              onClick={
                tangChu
              }
              title="Tăng cỡ chữ"
            >
              A+
            </button>

            <button
              onClick={
                inDe
              }
            >
              🖨 In đề
            </button>

            <button
              onClick={
                luuPDF
              }
            >
              📄 Lưu PDF
            </button>

            <button
              className="close-exam-v2"
              onClick={() =>
                setDeDangMo(
                  null
                )
              }
            >
              ✕ Đóng đề
            </button>
          </div>

          {/* PHẦN ĐỂ IN */}

          <div
            className="exam-print-area"
          >
            <div
              className="exam-paper-v2"
            >
              <div
                className="exam-paper-head"
              >
                <div>
                  <span>
                    ĐỀ LUYỆN TẬP
                  </span>

                  <h1>
                    {
                      deDangMo.tieu_de
                    }
                  </h1>

                  <div
                    className="exam-paper-meta"
                  >
                    <span>
                      Lớp{" "}
                      {deDangMo.lop ||
                        "—"}
                    </span>

                    <span>
                      {deDangMo.dang_bai ||
                        "Tự luận"}
                    </span>

                    {deDangMo.thoi_gian && (
                      <span>
                        {
                          deDangMo.thoi_gian
                        }{" "}
                        phút
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="exam-score-v2"
                >
                  <strong>
                    {deDangMo.so_diem ||
                      10}
                  </strong>

                  <small>
                    điểm
                  </small>
                </div>
              </div>

              {noiDungDangMo ? (
                <div
                  className="exam-content-v2"
                  style={{
                    fontSize:
                      `${coChu}px`,
                  }}
                >
                  {
                    noiDungDangMo
                  }
                </div>
              ) : (
                <div
                  className="notice"
                >
                  Đề đang được giáo viên kiểm tra lại nội dung.
                </div>
              )}

              <div
                className="exam-end-v2"
              >
                — HẾT —
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer
        className="app-footer"
      >
        <div
          className="footer-main"
        >
         <footer className="site-footer">
  <div className="site-footer-inner">
    <p className="footer-line footer-title">
      Ngân hàng đề tự luận Ngữ văn THCS
    </p>

    <p className="footer-line">
      Học tập mỗi ngày • Tiến bộ mỗi ngày
    </p>

    <p className="footer-line">
      App được tạo bởi <strong>GV: TRẦN THỊ NGUYỆT HỒNG</strong>
    </p>

    <p className="footer-line">
      Giáo viên Ngữ văn • Trường THCS Long Cang, Tây Ninh
    </p>

    <p className="footer-line">
      Zalo: <strong>0933122900</strong>
    </p>
  </div>
</footer>

          <span>
            Học tập mỗi ngày • Tiến bộ mỗi ngày
          </span>
        </div>

        <div
          className="footer-credit"
        >
          <p>
            App được tạo bởi
            <strong>
              {" "}
              GV: TRẦN THỊ NGUYỆT HỒNG
            </strong>
          </p>

          <p>
            Giáo viên Ngữ văn • Trường THCS Long Cang, Tây Ninh
          </p>

          <p>
            Zalo:{" "}
            <strong>
              0933122900
            </strong>
          </p>
        </div>
      </footer>

    </main>
  );
}
