"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import styles from "./admin.module.css";

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
  cong_khai: boolean;
  da_giao: boolean;
lan_giao_cuoi: string | null;
};

type FormData = {
  tieu_de: string;
  lop: string;
  nhom: string;
  the_loai: string;
  dang_bai: string;
  chu_de: string;
  ngu_lieu: string;
  cau_hoi: string;
  dap_an: string;
  thoi_gian: string;
  so_diem: string;
  muc_do: string;
  file_url: string;
  cong_khai: boolean;
};

const formMacDinh: FormData = {
  tieu_de: "",
  lop: "6",
  nhom: "Thơ",
  the_loai: "Thơ 4 chữ",
  dang_bai: "Đọc hiểu",
  chu_de: "",
  ngu_lieu: "",
  cau_hoi: "",
  dap_an: "",
  thoi_gian: "15",
  so_diem: "10",
  muc_do: "Nhận biết - Thông hiểu - Vận dụng",
  file_url: "",
  cong_khai: true,
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

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");

  const [daDangNhap, setDaDangNhap] = useState(false);
  const [laAdmin, setLaAdmin] = useState(false);
  const [dangTai, setDangTai] = useState(true);

  const [danhSach, setDanhSach] = useState<DeNguVan[]>([]);
  const [form, setForm] = useState<FormData>(formMacDinh);

  const [idDangSua, setIdDangSua] = useState<number | null>(null);

  const [thongBao, setThongBao] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [tuKhoa, setTuKhoa] = useState("");
const [deDaChon, setDeDaChon] =
  useState<number[]>([]);
  useEffect(() => {
    kiemTraDangNhap();
  }, []);

  async function kiemTraDangNhap() {
    setDangTai(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setDaDangNhap(false);
      setLaAdmin(false);
      setDangTai(false);
      return;
    }

    setDaDangNhap(true);

    const { data, error } = await supabase.rpc(
      "is_admin_user"
    );

    if (error || data !== true) {
      setLaAdmin(false);
      setDangTai(false);
      return;
    }

    setLaAdmin(true);

    await taiDanhSach();

    setDangTai(false);
  }

  async function dangNhap(e: FormEvent) {
    e.preventDefault();

    setThongBao("Đang đăng nhập...");

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: matKhau,
      });

    if (error) {
      setThongBao(
        "Đăng nhập không thành công: " +
          error.message
      );
      return;
    }

    setThongBao("");

    await kiemTraDangNhap();
  }

  async function dangXuat() {
    await supabase.auth.signOut();

    setDaDangNhap(false);
    setLaAdmin(false);
    setDanhSach([]);
    setThongBao("");
  }

  async function taiDanhSach() {
    const { data, error } = await supabase
      .from("de_ngu_van")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setThongBao(
        "Không tải được danh sách: " +
          error.message
      );
      return;
    }

    setDanhSach((data ?? []) as DeNguVan[]);
  }

  function thayDoi(
    ten: keyof FormData,
    giaTri: string | boolean
  ) {
    setForm((cu) => ({
      ...cu,
      [ten]: giaTri,
    }));
  }

  function taoPayload() {
    return {
      tieu_de: form.tieu_de.trim(),

      lop:
        form.lop.trim() === ""
          ? null
          : form.lop.trim(),

      nhom:
        form.nhom.trim() === ""
          ? null
          : form.nhom.trim(),

      the_loai:
        form.the_loai.trim() === ""
          ? null
          : form.the_loai.trim(),

      dang_bai:
        form.dang_bai.trim() === ""
          ? null
          : form.dang_bai.trim(),

      chu_de:
        form.chu_de.trim() === ""
          ? null
          : form.chu_de.trim(),

      ngu_lieu:
        form.ngu_lieu.trim() === ""
          ? null
          : form.ngu_lieu.trim(),

      cau_hoi:
        form.cau_hoi.trim() === ""
          ? null
          : form.cau_hoi.trim(),

      dap_an:
        form.dap_an.trim() === ""
          ? null
          : form.dap_an.trim(),

      thoi_gian:
        form.thoi_gian === ""
          ? null
          : Number(form.thoi_gian),

      so_diem:
        form.so_diem === ""
          ? null
          : Number(form.so_diem),

      muc_do:
        form.muc_do.trim() === ""
          ? null
          : form.muc_do.trim(),

      file_url:
        form.file_url.trim() === ""
          ? null
          : form.file_url.trim(),

      cong_khai: form.cong_khai,

      updated_at: new Date().toISOString(),
    };
  }

  async function luuDe(e: FormEvent) {
    e.preventDefault();

    if (!form.tieu_de.trim()) {
      setThongBao(
        "Cô cần nhập tên đề trước khi lưu."
      );
      return;
    }

    setDangLuu(true);
    setThongBao("");

    const payload = taoPayload();

    if (idDangSua === null) {
      const { error } = await supabase
        .from("de_ngu_van")
        .insert(payload);

      if (error) {
        setThongBao(
          "Không thêm được đề: " +
            error.message
        );
        setDangLuu(false);
        return;
      }

      setThongBao(
        "✓ Đã thêm đề mới thành công."
      );
    } else {
      const { error } = await supabase
        .from("de_ngu_van")
        .update(payload)
        .eq("id", idDangSua);

      if (error) {
        setThongBao(
          "Không sửa được đề: " +
            error.message
        );
        setDangLuu(false);
        return;
      }

      setThongBao(
        "✓ Đã cập nhật đề thành công."
      );
    }

    setForm(formMacDinh);
    setIdDangSua(null);

    await taiDanhSach();

    setDangLuu(false);
  }

  function suaDe(item: DeNguVan) {
    setIdDangSua(item.id);

    setForm({
      tieu_de: item.tieu_de ?? "",
      lop: item.lop ?? "",
      nhom: item.nhom ?? "",
      the_loai: item.the_loai ?? "",
      dang_bai: item.dang_bai ?? "",
      chu_de: item.chu_de ?? "",
      ngu_lieu: item.ngu_lieu ?? "",
      cau_hoi: item.cau_hoi ?? "",
      dap_an: item.dap_an ?? "",

      thoi_gian:
        item.thoi_gian === null
          ? ""
          : String(item.thoi_gian),

      so_diem:
        item.so_diem === null
          ? ""
          : String(item.so_diem),

      muc_do: item.muc_do ?? "",
      file_url: item.file_url ?? "",
      cong_khai: item.cong_khai,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function huySua() {
    setIdDangSua(null);
    setForm(formMacDinh);
    setThongBao("");
  }

  async function xoaDe(
    id: number,
    tieuDe: string
  ) {
    const dongY = window.confirm(
      `Cô có chắc muốn xóa đề:\n"${tieuDe}"?\n\nThao tác này không thể hoàn tác.`
    );

    if (!dongY) return;

    const { error } = await supabase
      .from("de_ngu_van")
      .delete()
      .eq("id", id);

    if (error) {
      setThongBao(
        "Không xóa được đề: " +
          error.message
      );
      return;
    }

    setThongBao(
      "✓ Đã xóa đề."
    );

    await taiDanhSach();
  }

  async function doiCongKhai(
    item: DeNguVan
  ) {
    const { error } = await supabase
      .from("de_ngu_van")
      .update({
        cong_khai: !item.cong_khai,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      setThongBao(
        "Không thay đổi được trạng thái: " +
          error.message
      );
      return;
    }

    await taiDanhSach();
  }
function doiChonDe(id: number) {
  setDeDaChon((cu) =>
    cu.includes(id)
      ? cu.filter((x) => x !== id)
      : [...cu, id]
  );
}

function chonTatCa() {
  const ids = danhSachLoc.map(
    (item) => item.id
  );

  const daChonHet =
    ids.length > 0 &&
    ids.every((id) =>
      deDaChon.includes(id)
    );

  if (daChonHet) {
    setDeDaChon([]);
  } else {
    setDeDaChon(ids);
  }
}

async function doiTrangThaiHangLoat(
  congKhai: boolean
) {
  if (!deDaChon.length) {
    setThongBao(
      "Cô chưa chọn đề nào."
    );
    return;
  }

  const { error } = await supabase
    .from("de_ngu_van")
    .update({
      cong_khai: congKhai,
      updated_at:
        new Date().toISOString(),
    })
    .in("id", deDaChon);

  if (error) {
    setThongBao(
      "Không cập nhật được: " +
        error.message
    );
    return;
  }

  setThongBao(
    congKhai
      ? `✓ Đã công khai ${deDaChon.length} đề.`
      : `✓ Đã ẩn ${deDaChon.length} đề.`
  );

  setDeDaChon([]);
  await taiDanhSach();
}
async function saoChepLinkGiaoBai(
  item: DeNguVan
) {
  if (!item.cong_khai) {
    setThongBao(
      "Đề này đang ẩn. Cô cần công khai đề trước khi gửi link cho học sinh."
    );
    return;
  }

  const link =
    `https://hong7214.github.io/ngan-hang-de-ngu-van/?de=${item.id}`;

  try {
    await navigator.clipboard.writeText(link);

    await supabase
      .from("de_ngu_van")
      .update({
        da_giao: true,
        lan_giao_cuoi:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", item.id);

    setThongBao(
      `✓ Đã sao chép link "${item.tieu_de}". Đề cũng đã được đánh dấu ĐÃ GIAO.`
    );

    await taiDanhSach();
  } catch {
    setThongBao(
      "Không sao chép được link. Cô thử lại."
    );
  }
}
async function xoaHangLoat() 
  if (!deDaChon.length) {
    setThongBao(
      "Cô chưa chọn đề nào."
    );
    return;
  }

  const dongY =
    window.confirm(
      `Cô có chắc muốn xóa ${deDaChon.length} đề đã chọn?\n\nKhông thể hoàn tác.`
    );

  if (!dongY) return;

  const { error } = await supabase
    .from("de_ngu_van")
    .delete()
    .in("id", deDaChon);

  if (error) {
    setThongBao(
      "Không xóa được: " +
        error.message
    );
    return;
  }

  setThongBao(
    `✓ Đã xóa ${deDaChon.length} đề.`
  );

  setDeDaChon([]);
  await taiDanhSach();
}
  async function doiDaGiao(item: DeNguVan) {
  const trangThaiMoi = !item.da_giao;

  const { error } = await supabase
    .from("de_ngu_van")
    .update({
      da_giao: trangThaiMoi,
      lan_giao_cuoi: trangThaiMoi
        ? new Date().toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", item.id);

  if (error) {
    setThongBao(
      "Không đổi được trạng thái giao bài: " +
        error.message
    );
    return;
  }

  setThongBao(
    trangThaiMoi
      ? `✓ Đã đánh dấu "${item.tieu_de}" là đã giao.`
      : `Đã chuyển "${item.tieu_de}" về chưa giao.`
  );
async function saoChepLinkGiaoBai(
  item: DeNguVan
) {
  if (!item.cong_khai) {
    setThongBao(
      "Đề này đang ẩn. Cô cần công khai đề trước khi gửi link cho học sinh."
    );
    return;
  }

  const link =
    `https://hong7214.github.io/ngan-hang-de-ngu-van/?de=${item.id}`;

  try {
    await navigator.clipboard.writeText(link);

    await supabase
      .from("de_ngu_van")
      .update({
        da_giao: true,
        lan_giao_cuoi:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", item.id);

    setThongBao(
      `✓ Đã sao chép link "${item.tieu_de}". Đề cũng đã được đánh dấu ĐÃ GIAO.`
    );

    await taiDanhSach();
  } catch {
    setThongBao(
      "Không sao chép được link. Cô thử lại."
    );
  }
}
  await taiDanhSach();
}
  const danhSachLoc = danhSach.filter(
    (item) => {
      const q = tuKhoa
        .trim()
        .toLowerCase();

      if (!q) return true;

      const text =
        `${item.tieu_de ?? ""} ${
          item.lop ?? ""
        } ${item.nhom ?? ""} ${
          item.the_loai ?? ""
        } ${item.chu_de ?? ""}`
          .toLowerCase();

      return text.includes(q);
    }
  );

  if (dangTai) {
    return (
      <main className={styles.loading}>
        Đang kiểm tra tài khoản...
      </main>
    );
  }

  if (!daDangNhap) {
    return (
      <main className={styles.loginPage}>

        <section className={styles.loginCard}>

          <div className={styles.logo}>
            NV
          </div>

          <h1>
            Quản trị ngân hàng đề
          </h1>

          <p className={styles.loginNote}>
            Dành riêng cho giáo viên quản trị.
          </p>

          <form onSubmit={dangNhap}>

            <label>
              Email quản trị
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              placeholder="Email"
            />

            <label>
              Mật khẩu
            </label>

            <input
              type="password"
              value={matKhau}
              onChange={(e) =>
                setMatKhau(e.target.value)
              }
              required
              placeholder="Mật khẩu"
            />

            <button
              type="submit"
              className={styles.loginButton}
            >
              Đăng nhập
            </button>

          </form>

          {thongBao && (
            <div className={styles.message}>
              {thongBao}
            </div>
          )}

        </section>

      </main>
    );
  }

  if (!laAdmin) {
    return (
      <main className={styles.loginPage}>

        <section className={styles.loginCard}>

          <h1>
            Không có quyền quản trị
          </h1>

          <p>
            Tài khoản này đã đăng nhập
            nhưng chưa được cấp quyền Admin.
          </p>

          <button
            className={styles.loginButton}
            onClick={dangXuat}
          >
            Đăng xuất
          </button>

        </section>

      </main>
    );
  }

  return (
    <main className={styles.adminPage}>

      <header className={styles.header}>

        <div>
          <div className={styles.smallTitle}>
            NGỮ VĂN THCS
          </div>

          <h1>
            Quản trị ngân hàng đề
          </h1>

          <p>
            Thêm, sửa, xóa và quản lý
            đề giao cho học sinh.
          </p>
        </div>

        <button
          onClick={dangXuat}
          className={styles.logout}
        >
          Đăng xuất
        </button>

      </header>

      <div className={styles.container}>

        <section className={styles.formCard}>

          <div className={styles.sectionTitle}>

            <div>
              <span>
                {idDangSua === null
                  ? "THÊM ĐỀ MỚI"
                  : "CHỈNH SỬA ĐỀ"}
              </span>

              <h2>
                {idDangSua === null
                  ? "Nhập nội dung đề"
                  : `Đang sửa đề #${idDangSua}`}
              </h2>
            </div>

            {idDangSua !== null && (
              <button
                type="button"
                onClick={huySua}
                className={styles.secondary}
              >
                Hủy sửa
              </button>
            )}

          </div>

          <form
            onSubmit={luuDe}
            className={styles.form}
          >

            <div className={styles.full}>
              <label>
                Tên đề *
              </label>

              <input
                value={form.tieu_de}
                onChange={(e) =>
                  thayDoi(
                    "tieu_de",
                    e.target.value
                  )
                }
                placeholder="Ví dụ: Đề 01 - Tình mẹ"
                required
              />
            </div>

            <div>
              <label>Lớp</label>

              <select
                value={form.lop}
                onChange={(e) =>
                  thayDoi(
                    "lop",
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

            <div>
              <label>Nhóm</label>

              <select
                value={form.nhom}
                onChange={(e) =>
                  thayDoi(
                    "nhom",
                    e.target.value
                  )
                }
              >
                <option>Thơ</option>
                <option>Truyện</option>
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
            </div>

            <div>
              <label>Thể loại</label>

              <select
                value={form.the_loai}
                onChange={(e) =>
                  thayDoi(
                    "the_loai",
                    e.target.value
                  )
                }
              >
                {THE_LOAI_THO.map(
                  (item) => (
                    <option key={item}>
                      {item}
                    </option>
                  )
                )}

                <option>
                  Truyện ngắn
                </option>

                <option>
                  Văn xuôi
                </option>

                <option>
                  Nghị luận xã hội
                </option>

                <option>
                  Nghị luận văn học
                </option>
              </select>
            </div>

            <div>
              <label>Dạng bài</label>

              <select
                value={form.dang_bai}
                onChange={(e) =>
                  thayDoi(
                    "dang_bai",
                    e.target.value
                  )
                }
              >
                <option>
                  Đọc hiểu
                </option>

                <option>
                  Viết đoạn văn
                </option>

                <option>
                  Nghị luận xã hội
                </option>

                <option>
                  Nghị luận văn học
                </option>

                <option>
                  Đọc hiểu + Viết
                </option>
              </select>
            </div>

            <div className={styles.full}>
              <label>Chủ đề</label>

              <input
                value={form.chu_de}
                onChange={(e) =>
                  thayDoi(
                    "chu_de",
                    e.target.value
                  )
                }
                placeholder="Gia đình, quê hương, thiên nhiên..."
              />
            </div>

            <div className={styles.full}>
              <label>
                Ngữ liệu / văn bản / bài thơ
              </label>

              <textarea
                rows={9}
                value={form.ngu_lieu}
                onChange={(e) =>
                  thayDoi(
                    "ngu_lieu",
                    e.target.value
                  )
                }
                placeholder="Dán bài thơ hoặc văn bản vào đây..."
              />
            </div>

            <div className={styles.full}>
              <label>
                Câu hỏi
              </label>

              <textarea
                rows={8}
                value={form.cau_hoi}
                onChange={(e) =>
                  thayDoi(
                    "cau_hoi",
                    e.target.value
                  )
                }
                placeholder={"Câu 1. ...\nCâu 2. ...\nCâu 3. ..."}
              />
            </div>

            <div className={styles.full}>
              <label>
                Đáp án / hướng dẫn chấm
              </label>

              <textarea
                rows={8}
                value={form.dap_an}
                onChange={(e) =>
                  thayDoi(
                    "dap_an",
                    e.target.value
                  )
                }
                placeholder="Phần này chỉ dành cho giáo viên..."
              />
            </div>

            <div>
              <label>
                Thời gian (phút)
              </label>

              <input
                type="number"
                min="1"
                value={form.thoi_gian}
                onChange={(e) =>
                  thayDoi(
                    "thoi_gian",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label>
                Tổng điểm
              </label>

              <input
                type="number"
                min="0"
                step="0.25"
                value={form.so_diem}
                onChange={(e) =>
                  thayDoi(
                    "so_diem",
                    e.target.value
                  )
                }
              />
            </div>

            <div className={styles.full}>
              <label>
                Mức độ
              </label>

              <input
                value={form.muc_do}
                onChange={(e) =>
                  thayDoi(
                    "muc_do",
                    e.target.value
                  )
                }
                placeholder="Nhận biết - Thông hiểu - Vận dụng"
              />
            </div>

            <div className={styles.full}>
              <label>
                Link file Word/PDF
              </label>

              <input
                value={form.file_url}
                onChange={(e) =>
                  thayDoi(
                    "file_url",
                    e.target.value
                  )
                }
                placeholder="https://..."
              />
            </div>

            <div
              className={
                styles.checkboxArea
              }
            >
              <input
                id="cong-khai"
                type="checkbox"
                checked={
                  form.cong_khai
                }
                onChange={(e) =>
                  thayDoi(
                    "cong_khai",
                    e.target.checked
                  )
                }
              />

              <label htmlFor="cong-khai">
                Công khai cho học sinh
              </label>
            </div>

            <div className={styles.full}>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={dangLuu}
              >
                {dangLuu
                  ? "Đang lưu..."
                  : idDangSua === null
                  ? "＋ Thêm đề vào ngân hàng"
                  : "✓ Lưu thay đổi"}
              </button>
            </div>

          </form>

          {thongBao && (
            <div className={styles.message}>
              {thongBao}
            </div>
          )}

        </section>

        <section className={styles.listCard}>

          <div className={styles.listHeader}>

            <div>
              <span>
                NGÂN HÀNG HIỆN CÓ
              </span>

              <h2>
                {danhSach.length} đề
              </h2>
            </div>

            <input
              className={styles.search}
              value={tuKhoa}
              onChange={(e) =>
                setTuKhoa(
                  e.target.value
                )
              }
              placeholder="🔎 Tìm đề..."
            />

          </div>
<div className={styles.bulkBar}>

  <button
    onClick={chonTatCa}
    className={styles.selectAll}
  >
    ☑ Chọn tất cả
  </button>

  <span>
    Đã chọn:
    <strong>
      {" "}
      {deDaChon.length}
    </strong>
  </span>

  <button
    onClick={() =>
      doiTrangThaiHangLoat(true)
    }
    className={styles.bulkPublic}
  >
    👁 Công khai
  </button>

  <button
    onClick={() =>
      doiTrangThaiHangLoat(false)
    }
    className={styles.bulkHide}
  >
    🙈 Ẩn
  </button>

  <button
    onClick={xoaHangLoat}
    className={styles.bulkDelete}
  >
    🗑 Xóa
  </button>

</div>
          <div className={styles.tableWrap}>

            <table>

              <thead>
              <tr>
  <th>Chọn</th>
  <th>Đề</th>
                  <th>Lớp</th>
                  <th>Thể loại</th>
               <th>Trạng thái</th>
<th>Giao bài</th>
<th>Thao tác</th>
                </tr>
              </thead>

              <tbody>

                {danhSachLoc.map(
                  (item) => (

                    <tr key={item.id}>
<td>
  <input
    type="checkbox"
    checked={deDaChon.includes(
      item.id
    )}
    onChange={() =>
      doiChonDe(item.id)
    }
  />
</td>
                      <td>
                        <strong>
                          {item.tieu_de}
                        </strong>

                        <small>
                          {item.chu_de ||
                            item.dang_bai ||
                            ""}
                        </small>
                      </td>

                      <td>
                        {item.lop}
                      </td>

                      <td>
                        {item.the_loai ||
                          item.nhom}
                      </td>

                      <td>
                        <button
                          onClick={() =>
                            doiCongKhai(
                              item
                            )
                          }
                          className={
                            item.cong_khai
                              ? styles.publicButton
                              : styles.hiddenButton
                          }
                        >
                          {item.cong_khai
                            ? "Đang công khai"
                            : "Đang ẩn"}
                        </button>
                      </td>
<td>
  <div className={styles.assignActions}>

    <button
      onClick={() =>
        doiDaGiao(item)
      }
      className={
        item.da_giao
          ? styles.assigned
          : styles.notAssigned
      }
    >
      {item.da_giao
        ? "✓ Đã giao"
        : "Chưa giao"}
    </button>

    <button
      onClick={() =>
        saoChepLinkGiaoBai(item)
      }
      className={styles.copyLink}
    >
      🔗 Lấy link
    </button>

  </div>
</td>
                      <td>
                        <div
                          className={
                            styles.actions
                          }
                        >
                          <button
                            onClick={() =>
                              suaDe(item)
                            }
                            className={
                              styles.edit
                            }
                          >
                            Sửa
                          </button>

                          <button
                            onClick={() =>
                              xoaDe(
                                item.id,
                                item.tieu_de
                              )
                            }
                            className={
                              styles.delete
                            }
                          >
                            Xóa
                          </button>
                        </div>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

    </main>
  );
}
