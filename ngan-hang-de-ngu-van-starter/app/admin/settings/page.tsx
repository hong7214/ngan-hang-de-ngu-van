"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";
import styles from "./settings.module.css";

type Settings = {
  teacher_name: string;
  teacher_school: string;
  teacher_message: string;
  teacher_photo_url: string | null;
};

export default function SettingsPage() {
  const [form, setForm] =
    useState<Settings>({
      teacher_name: "",
      teacher_school: "",
      teacher_message: "",
      teacher_photo_url: null,
    });

  const [dangTai, setDangTai] =
    useState(true);

  const [dangLuu, setDangLuu] =
    useState(false);

  const [thongBao, setThongBao] =
    useState("");

  useEffect(() => {
    taiThongTin();
  }, []);

  async function taiThongTin() {
    setDangTai(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setThongBao(
        "Cô cần đăng nhập trang quản trị trước."
      );
      setDangTai(false);
      return;
    }

    const { data: isAdmin } =
      await supabase.rpc(
        "is_admin_user"
      );

    if (isAdmin !== true) {
      setThongBao(
        "Tài khoản này không có quyền quản trị."
      );
      setDangTai(false);
      return;
    }

    const { data, error } =
      await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();

    if (error) {
      setThongBao(
        "Không tải được thông tin: " +
          error.message
      );
    } else if (data) {
      setForm({
        teacher_name:
          data.teacher_name ?? "",
        teacher_school:
          data.teacher_school ?? "",
        teacher_message:
          data.teacher_message ?? "",
        teacher_photo_url:
          data.teacher_photo_url ?? null,
      });
    }

    setDangTai(false);
  }

  async function taiAnh(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setThongBao(
        "Cô vui lòng chọn file hình ảnh."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setThongBao(
        "Ảnh quá lớn. Nên dùng ảnh dưới 5MB."
      );
      return;
    }

    setThongBao(
      "Đang tải ảnh lên..."
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setThongBao(
        "Phiên đăng nhập đã hết."
      );
      return;
    }

    const duoiFile =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const tenFile =
      `gv-${user.id}-${Date.now()}.${duoiFile}`;

    const { error } =
      await supabase.storage
        .from("teacher-images")
        .upload(
          tenFile,
          file,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

    if (error) {
      setThongBao(
        "Không tải được ảnh: " +
          error.message
      );
      return;
    }

    const { data } =
      supabase.storage
        .from("teacher-images")
        .getPublicUrl(tenFile);

    setForm((cu) => ({
      ...cu,
      teacher_photo_url:
        data.publicUrl,
    }));

    setThongBao(
      "✓ Đã tải ảnh. Cô bấm Lưu thay đổi."
    );
  }

  async function luuThongTin(
    e: FormEvent
  ) {
    e.preventDefault();

    setDangLuu(true);
    setThongBao("");

    const { error } =
      await supabase
        .from("site_settings")
        .update({
          teacher_name:
            form.teacher_name.trim(),
          teacher_school:
            form.teacher_school.trim(),
          teacher_message:
            form.teacher_message.trim(),
          teacher_photo_url:
            form.teacher_photo_url,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", 1);

    if (error) {
      setThongBao(
        "Không lưu được: " +
          error.message
      );
    } else {
      setThongBao(
        "✓ Đã cập nhật thông tin giáo viên."
      );
    }

    setDangLuu(false);
  }

  if (dangTai) {
    return (
      <main className={styles.loading}>
        Đang tải...
      </main>
    );
  }

  return (
    <main className={styles.page}>

      <section className={styles.card}>

        <a
          href="../"
          className={styles.back}
        >
          ← Quay lại trang quản trị
        </a>

        <div className={styles.heading}>
          <span>
            CÀI ĐẶT WEBSITE
          </span>

          <h1>
            Thông tin giáo viên
          </h1>

          <p>
            Thông tin này sẽ xuất hiện
            ở đầu trang ngân hàng đề.
          </p>
        </div>

        <div className={styles.photoArea}>

          {form.teacher_photo_url ? (
            <img
              src={
                form.teacher_photo_url
              }
              alt="Ảnh giáo viên"
            />
          ) : (
            <div
              className={
                styles.placeholder
              }
            >
              GV
            </div>
          )}

          <label
            className={
              styles.uploadButton
            }
          >
            📷 Chọn ảnh giáo viên

            <input
              type="file"
              accept="image/*"
              onChange={taiAnh}
              hidden
            />
          </label>

        </div>

        <form
          onSubmit={luuThongTin}
          className={styles.form}
        >

          <label>
            Họ và tên giáo viên
          </label>

          <input
            value={
              form.teacher_name
            }
            onChange={(e) =>
              setForm({
                ...form,
                teacher_name:
                  e.target.value,
              })
            }
            placeholder="Ví dụ: Cô Nguyễn Thị A"
          />

          <label>
            Đơn vị / Chức vụ
          </label>

          <input
            value={
              form.teacher_school
            }
            onChange={(e) =>
              setForm({
                ...form,
                teacher_school:
                  e.target.value,
              })
            }
            placeholder="Giáo viên Ngữ văn - Trường THCS..."
          />

          <label>
            Lời nhắn tới học sinh
          </label>

          <textarea
            rows={4}
            value={
              form.teacher_message
            }
            onChange={(e) =>
              setForm({
                ...form,
                teacher_message:
                  e.target.value,
              })
            }
            placeholder="Chúc các em học tốt..."
          />

          <button
            type="submit"
            disabled={dangLuu}
          >
            {dangLuu
              ? "Đang lưu..."
              : "✓ Lưu thay đổi"}
          </button>

        </form>

        {thongBao && (
          <div className={styles.notice}>
            {thongBao}
          </div>
        )}

      </section>

    </main>
  );
}
