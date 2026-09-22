"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import styles from "./import.module.css";

type DeNhap = {
  id: string;
  chon: boolean;
  tenFile: string;

  tieu_de: string;
  lop: string;
  nhom: string;
  the_loai: string;
  dang_bai: string;

  ngu_lieu: string;
  cau_hoi: string;
  dap_an: string;

  canhBao: string[];
};

export default function ImportPage() {
  const [lopMacDinh, setLopMacDinh] = useState("9");

  const [danhSach, setDanhSach] =
    useState<DeNhap[]>([]);

  const [dangDoc, setDangDoc] =
    useState(false);

  const [dangNhap, setDangNhap] =
    useState(false);

  const [thongBao, setThongBao] =
    useState("");

  const [loiFile, setLoiFile] =
    useState<string[]>([]);

  const [congKhaiNgay, setCongKhaiNgay] =
    useState(false);

  useEffect(() => {
    kiemTraAdmin();
  }, []);

  async function kiemTraAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setThongBao(
        "Cô chưa đăng nhập tài khoản quản trị."
      );
      return;
    }

    const { data } = await supabase.rpc(
      "is_admin_user"
    );

    if (data !== true) {
      setThongBao(
        "Tài khoản hiện tại không có quyền quản trị."
      );
    }
  }

  function chuanHoa(text: string) {
    return text
      .replace(/\r/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function boDuoiFile(name: string) {
    return name.replace(
      /\.(docx|doc|txt|pdf)$/i,
      ""
    );
  }

  function layTheTho(
    fileName: string,
    text: string
  ) {
    const gop =
      `${fileName} ${text.substring(
        0,
        2000
      )}`.toUpperCase();

    const soChu = gop.match(
      /THƠ\s*([45678])\s*CHỮ/
    );

    if (soChu) {
      return `Thơ ${soChu[1]} chữ`;
    }

    if (
      /SONG\s*THẤT\s*LỤC\s*BÁT/.test(
        gop
      )
    ) {
      return "Song thất lục bát";
    }

    if (/LỤC\s*BÁT/.test(gop)) {
      return "Lục bát";
    }

    if (/THƠ\s*TỰ\s*DO/.test(gop)) {
      return "Thơ tự do";
    }

    if (/ĐƯỜNG\s*LUẬT/.test(gop)) {
      return "Thơ Đường luật";
    }

    return "Thơ khác";
  }

  function layTieuDe(fileName: string) {
    let ten = boDuoiFile(fileName);

    ten = ten.replace(
      /^THƠ\s*[45678]\s*CHỮ\s*[.\-_:]?\s*/i,
      ""
    );

    ten = ten.replace(
      /^SONG\s*THẤT\s*LỤC\s*BÁT\s*[.\-_:]?\s*/i,
      ""
    );

    ten = ten.replace(
      /^LỤC\s*BÁT\s*[.\-_:]?\s*/i,
      ""
    );

    ten = ten.replace(
      /^THƠ\s*TỰ\s*DO\s*[.\-_:]?\s*/i,
      ""
    );

    return ten
      .replace(/[._]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function layLop(
    text: string,
    lopMacDinh: string
  ) {
    const dau = text
      .substring(0, 2500)
      .toUpperCase();

    const match = dau.match(
      /(?:LỚP|NV)\s*[-_:]?\s*([6-9])\b/
    );

    if (match) {
      return match[1];
    }

    return lopMacDinh;
  }

  function tachDeVaDapAn(text: string) {
    const noiDung = chuanHoa(text);

    const regexDapAn =
      /(ĐÁP\s*ÁN\s*VÀ\s*HƯỚNG\s*DẪN\s*CHẤM|HƯỚNG\s*DẪN\s*CHẤM|ĐÁP\s*ÁN)/i;

    const match =
      noiDung.match(regexDapAn);

    let phanDe = noiDung;
    let dapAn = "";

    if (
      match &&
      typeof match.index === "number"
    ) {
      phanDe = noiDung
        .slice(0, match.index)
        .trim();

      dapAn = noiDung
        .slice(match.index)
        .trim();
    }

    const viTriCauHoi =
      phanDe.search(
        /\bCâu\s*1\s*[\.\(:]/i
      );

    let nguLieu = "";
    let cauHoi = "";

    if (viTriCauHoi >= 0) {
      nguLieu = phanDe
        .slice(0, viTriCauHoi)
        .trim();

      cauHoi = phanDe
        .slice(viTriCauHoi)
        .trim();
    } else {
      nguLieu = phanDe;
    }

    return {
      nguLieu,
      cauHoi,
      dapAn,
    };
  }

  function phanTich(
    fileName: string,
    text: string
  ): DeNhap {
    const canhBao: string[] = [];

    const {
      nguLieu,
      cauHoi,
      dapAn,
    } = tachDeVaDapAn(text);

    if (!cauHoi) {
      canhBao.push(
        "Chưa tự xác định được phần câu hỏi"
      );
    }

    if (!dapAn) {
      canhBao.push(
        "Chưa tìm thấy đáp án/hướng dẫn chấm"
      );
    }

    const coPhanViet =
      /(PHẦN\s*(II|2).*?(VIẾT|LÀM\s*VĂN)|PHẦN\s*VIẾT|LÀM\s*VĂN)/i.test(
        text
      );

    return {
      id:
        Date.now().toString() +
        Math.random().toString(),

      chon: true,

      tenFile: fileName,

      tieu_de: layTieuDe(fileName),

      lop: layLop(
        text,
        lopMacDinh
      ),

      nhom: "Thơ",

      the_loai: layTheTho(
        fileName,
        text
      ),

      dang_bai: coPhanViet
        ? "Đọc hiểu + Viết"
        : "Đọc hiểu",

      ngu_lieu: nguLieu,

      cau_hoi: cauHoi,

      dap_an: dapAn,

      canhBao,
    };
  }

  async function docFile(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const files =
      Array.from(
        e.target.files ?? []
      );

    if (!files.length) return;

    setDangDoc(true);
    setThongBao("");
    setLoiFile([]);

    const ketQua: DeNhap[] = [];
    const loi: string[] = [];

    for (const file of files) {
      try {
        const tenThuong =
          file.name.toLowerCase();

        if (
          tenThuong.endsWith(".doc")
        ) {
          loi.push(
            `${file.name}: đây là file .doc cũ. Hãy đổi sang .docx trước.`
          );
          continue;
        }

        let text = "";

        if (
          tenThuong.endsWith(".docx")
        ) {
          const buffer =
            await file.arrayBuffer();

          // Mammoth đọc file DOCX trực tiếp trong trình duyệt.
          // @ts-ignore
          const moduleMammoth =
            await import("mammoth");

          const mammoth: any =
            (moduleMammoth as any)
              .default ??
            moduleMammoth;

          const result =
            await mammoth.extractRawText(
              {
                arrayBuffer: buffer,
              }
            );

          text =
            result.value ?? "";
        } else if (
          tenThuong.endsWith(".txt")
        ) {
          text = await file.text();
        } else {
          loi.push(
            `${file.name}: hiện chưa hỗ trợ định dạng này.`
          );
          continue;
        }

        if (!text.trim()) {
          loi.push(
            `${file.name}: không đọc được nội dung.`
          );
          continue;
        }

        ketQua.push(
          phanTich(
            file.name,
            text
          )
        );
      } catch (err) {
        loi.push(
          `${file.name}: lỗi khi đọc file.`
        );
      }
    }

    setDanhSach(ketQua);
    setLoiFile(loi);

    setDangDoc(false);

    if (ketQua.length) {
      setThongBao(
        `Đã đọc và phân tích ${ketQua.length} file. Cô kiểm tra bảng bên dưới trước khi nhập.`
      );
    }
  }

  function capNhat(
    index: number,
    field:
      | "tieu_de"
      | "lop"
      | "the_loai",
    value: string
  ) {
    setDanhSach((cu) => {
      const moi = [...cu];

      moi[index] = {
        ...moi[index],
        [field]: value,
      };

      return moi;
    });
  }

  function doiChon(
    index: number
  ) {
    setDanhSach((cu) => {
      const moi = [...cu];

      moi[index] = {
        ...moi[index],
        chon:
          !moi[index].chon,
      };

      return moi;
    });
  }

  async function nhapTatCa() {
    const chon =
      danhSach.filter(
        (x) => x.chon
      );

    if (!chon.length) {
      setThongBao(
        "Chưa có đề nào được chọn."
      );
      return;
    }

    setDangNhap(true);
    setThongBao(
      "Đang nhập dữ liệu..."
    );

    const rows =
      chon.map((x) => ({
        tieu_de: x.tieu_de,

        lop: x.lop,

        nhom: x.nhom,

        the_loai:
          x.the_loai,

        dang_bai:
          x.dang_bai,

        chu_de: null,

        ngu_lieu:
          x.ngu_lieu,

        cau_hoi:
          x.cau_hoi,

        dap_an:
          x.dap_an,

        thoi_gian: null,

        so_diem: 10,

        muc_do: null,

        file_url: null,

        cong_khai:
          congKhaiNgay,
      }));

    const { error } =
      await supabase
        .from("de_ngu_van")
        .insert(rows);

    if (error) {
      setThongBao(
        "Không nhập được: " +
          error.message
      );

      setDangNhap(false);
      return;
    }

    setThongBao(
      `✓ Đã nhập thành công ${rows.length} đề vào ngân hàng.`
    );

    setDanhSach([]);
    setDangNhap(false);
  }

  return (
    <main
      className={
        styles.page
      }
    >
      <div
        className={
          styles.container
        }
      >
        <a
          href="../"
          className={
            styles.back
          }
        >
          ← Quay lại trang quản trị
        </a>

        <h1>
          Nhập đề hàng loạt
        </h1>

        <p
          className={
            styles.description
          }
        >
          Chọn nhiều file Word
          cùng lúc. Hệ thống sẽ
          tự tách ngữ liệu,
          câu hỏi và đáp án.
        </p>

        <section
          className={
            styles.uploadBox
          }
        >
          <div>
            <label>
              Lớp mặc định
            </label>

            <select
              value={
                lopMacDinh
              }
              onChange={(e) =>
                setLopMacDinh(
                  e.target.value
                )
              }
            >
              <option value="6">
                Lớp 6
              </option>
              <option value="7">
                Lớp 7
              </option>
              <option value="8">
                Lớp 8
              </option>
              <option value="9">
                Lớp 9
              </option>
            </select>
          </div>

          <div
            className={
              styles.fileArea
            }
          >
            <label
              className={
                styles.fileButton
              }
            >
              📁 Chọn nhiều file Word

              <input
                type="file"
                multiple
                accept=".docx,.doc,.txt"
                onChange={
                  docFile
                }
                hidden
              />
            </label>

            <small>
              Hiện hỗ trợ tốt:
              DOCX. File DOC cũ
              sẽ được báo để đổi
              sang DOCX.
            </small>
          </div>
        </section>

        {dangDoc && (
          <div
            className={
              styles.notice
            }
          >
            Đang đọc và phân tích
            các file...
          </div>
        )}

        {thongBao && (
          <div
            className={
              styles.notice
            }
          >
            {thongBao}
          </div>
        )}

        {loiFile.length >
          0 && (
          <div
            className={
              styles.warning
            }
          >
            <strong>
              File cần kiểm tra:
            </strong>

            {loiFile.map(
              (x) => (
                <div key={x}>
                  • {x}
                </div>
              )
            )}
          </div>
        )}

        {danhSach.length >
          0 && (
          <>
            <div
              className={
                styles.topActions
              }
            >
              <label>
                <input
                  type="checkbox"
                  checked={
                    congKhaiNgay
                  }
                  onChange={(e) =>
                    setCongKhaiNgay(
                      e.target
                        .checked
                    )
                  }
                />

                Công khai ngay
                cho học sinh
              </label>

              <button
                onClick={
                  nhapTatCa
                }
                disabled={
                  dangNhap
                }
              >
                {dangNhap
                  ? "Đang nhập..."
                  : `Nhập ${
                      danhSach.filter(
                        (x) =>
                          x.chon
                      ).length
                    } đề đã chọn`}
              </button>
            </div>

            <div
              className={
                styles.cards
              }
            >
              {danhSach.map(
                (de, index) => (
                  <article
                    className={
                      styles.card
                    }
                    key={de.id}
                  >
                    <div
                      className={
                        styles.cardHeader
                      }
                    >
                      <input
                        type="checkbox"
                        checked={
                          de.chon
                        }
                        onChange={() =>
                          doiChon(
                            index
                          )
                        }
                      />

                      <strong>
                        {
                          de.tenFile
                        }
                      </strong>
                    </div>

                    <div
                      className={
                        styles.row
                      }
                    >
                      <div>
                        <label>
                          Tên đề
                        </label>

                        <input
                          value={
                            de.tieu_de
                          }
                          onChange={(e) =>
                            capNhat(
                              index,
                              "tieu_de",
                              e.target
                                .value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label>
                          Lớp
                        </label>

                        <select
                          value={
                            de.lop
                          }
                          onChange={(e) =>
                            capNhat(
                              index,
                              "lop",
                              e.target
                                .value
                            )
                          }
                        >
                          <option value="6">
                            6
                          </option>
                          <option value="7">
                            7
                          </option>
                          <option value="8">
                            8
                          </option>
                          <option value="9">
                            9
                          </option>
                        </select>
                      </div>

                      <div>
                        <label>
                          Thể loại
                        </label>

                        <input
                          value={
                            de.the_loai
                          }
                          onChange={(e) =>
                            capNhat(
                              index,
                              "the_loai",
                              e.target
                                .value
                            )
                          }
                        />
                      </div>
                    </div>

                    {de.canhBao
                      .length >
                      0 && (
                      <div
                        className={
                          styles.itemWarning
                        }
                      >
                        ⚠{" "}
                        {de.canhBao.join(
                          " • "
                        )}
                      </div>
                    )}

                    <details>
                      <summary>
                        Xem nội dung
                        hệ thống đã
                        tách
                      </summary>

                      <h4>
                        Ngữ liệu
                      </h4>

                      <pre>
                        {
                          de.ngu_lieu
                        }
                      </pre>

                      <h4>
                        Câu hỏi
                      </h4>

                      <pre>
                        {
                          de.cau_hoi
                        }
                      </pre>

                      <h4>
                        Đáp án
                      </h4>

                      <pre>
                        {
                          de.dap_an
                        }
                      </pre>
                    </details>
                  </article>
                )
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
