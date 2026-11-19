export const SAMPLE_EXAMS = [
  {
    id: 'exam_tv_mau_01',
    title: 'Đề ôn tập Tiếng Việt tổng hợp – Đề số 01',
    description:
      'Gồm 20 câu hỏi đơn về chính tả, từ vựng, ngữ pháp, biện pháp tu từ và 2 đoạn đọc hiểu (Câu 21–25, Câu 26–30).',
    durationMinutes: 40,
    isPublished: true,
    createdAt: '2026-11-19T08:00:00.000Z',
    updatedAt: '2026-11-19T08:00:00.000Z',
    singleQuestions: [
      {
        number: 1,
        question: 'Dòng nào dưới đây viết đúng chính tả tất cả các từ?',
        options: {
          A: 'Sáng sủa, chia sẻ, xuất sắc, trau chuốt',
          B: 'Sáng sủa, chia xẻ, suất sắc, trau chuốt',
          C: 'Xáng sủa, chia sẻ, xuất sắc, chau chuốt',
          D: 'Sáng sủa, chia sẻ, xuất xắc, trau chuốt'
        },
        correctAnswer: 'A',
        explanation: 'Viết đúng là: sáng sủa, chia sẻ, xuất sắc, trau chuốt.'
      },
      {
        number: 2,
        question: 'Từ nào dưới đây là từ láy?',
        options: {
          A: 'Sách vở',
          B: 'Lung linh',
          C: 'Quần áo',
          D: 'Bàn ghế'
        },
        correctAnswer: 'B',
        explanation: '"Lung linh" là từ láy âm đầu l-. Các từ còn lại là từ ghép.'
      },
      {
        number: 3,
        question: 'Từ "đi" trong câu nào dưới đây được dùng theo nghĩa gốc?',
        options: {
          A: 'Đôi giày này đi rất êm chân.',
          B: 'Tàu hỏa đang đi vào sân ga.',
          C: 'Em bé đang tập đi từng bước nhỏ.',
          D: 'Cầu thủ số 10 đi bóng khéo léo.'
        },
        correctAnswer: 'C',
        explanation: 'Nghĩa gốc của "đi" là hoạt động tự di chuyển bằng hai chân của người hoặc động vật.'
      },
      {
        number: 4,
        question: 'Câu văn: "Những cánh đồng lúa chín vàng ươm như tấm thảm lụa khổng lồ." sử dụng biện pháp tu từ nào?',
        options: {
          A: 'Nhân hóa',
          B: 'Ẩn dụ',
          C: 'So sánh',
          D: 'Hoán dụ'
        },
        correctAnswer: 'C',
        explanation: 'Có từ so sánh "như" đối chiếu "những cánh đồng lúa chín vàng ươm" với "tấm thảm lụa khổng lồ".'
      },
      {
        number: 5,
        question: 'Từ nào đồng nghĩa với từ "siêng năng"?',
        options: {
          A: 'Lười biếng',
          B: 'Chăm chỉ',
          C: 'Cẩu thả',
          D: 'Nóng nảy'
        },
        correctAnswer: 'B',
        explanation: '"Chăm chỉ" và "siêng năng" cùng chỉ đức tính cần cù, chịu khó.'
      },
      {
        number: 6,
        question: 'Thành ngữ "Uống nước nhớ nguồn" khuyên chúng ta điều gì?',
        options: {
          A: 'Phải biết tiết kiệm nước sạch trong sinh hoạt',
          B: 'Phải biết ơn những người đã tạo dựng, giúp đỡ mình',
          C: 'Phải tìm hiểu nguồn gốc các dòng sông lớn',
          D: 'Phải rèn luyện sức khỏe mỗi ngày'
        },
        correctAnswer: 'B',
        explanation: 'Thành ngữ ca ngợi lòng biết ơn tổ tiên, thầy cô và những người đi trước.'
      },
      {
        number: 7,
        question: 'Trong câu "Mùa xuân, cây cối đâm chồi nảy lộc.", bộ phận nào là chủ ngữ?',
        options: {
          A: 'Mùa xuân',
          B: 'Cây cối',
          C: 'Đâm chồi nảy lộc',
          D: 'Mùa xuân, cây cối'
        },
        correctAnswer: 'B',
        explanation: '"Mùa xuân" là trạng ngữ chỉ thời gian; "cây cối" là chủ ngữ; "đâm chồi nảy lộc" là vị ngữ.'
      },
      {
        number: 8,
        question: 'Dòng nào chỉ gồm các danh từ?',
        options: {
          A: 'Học sinh, quyển vở, dòng sông, ngôi trường',
          B: 'Chạy nhảy, quyển vở, xinh đẹp, ngôi trường',
          C: 'Dòng sông, xanh biếc, học sinh, lắng nghe',
          D: 'Ngôi trường, dịu dàng, ánh nắng, đọc sách'
        },
        correctAnswer: 'A',
        explanation: 'Học sinh, quyển vở, dòng sông, ngôi trường đều là danh từ chỉ người và sự vật.'
      },
      {
        number: 9,
        question: 'Từ "bình minh" trái nghĩa với từ nào sau đây?',
        options: {
          A: 'Rạng đông',
          B: 'Buổi sáng',
          C: 'Hoàng hôn',
          D: 'Ban trưa'
        },
        correctAnswer: 'C',
        explanation: 'Bình minh là lúc mặt trời mọc, trái nghĩa với hoàng hôn là lúc mặt trời lặn.'
      },
      {
        number: 10,
        question: 'Câu nào dưới đây là câu hỏi (nghi vấn) dùng với mục đích cầu khiến lịch sự?',
        options: {
          A: 'Hôm nay trời có nắng không?',
          B: 'Bạn có thể mở giúp mình ô cửa sổ được không?',
          C: 'Ai là người vẽ bức tranh này thế?',
          D: 'Mấy giờ thì tiết học bắt đầu?'
        },
        correctAnswer: 'B',
        explanation: 'Câu B dùng hình thức câu hỏi để đề nghị, nhờ vả một cách lịch sự.'
      },
      {
        number: 11,
        question: 'Cách viết hoa nào dưới đây là đúng quy tắc chính tả tiếng Việt?',
        options: {
          A: 'Thành phố Hồ Chí Minh',
          B: 'Thành Phố hồ chí minh',
          C: 'thành phố Hồ chí minh',
          D: 'Thành phố hồ Chí Minh'
        },
        correctAnswer: 'A',
        explanation: 'Viết hoa chữ cái đầu của danh từ chung đứng đầu tên đơn vị hành chính và viết hoa tất cả các âm tiết tên riêng.'
      },
      {
        number: 12,
        question: 'Hai câu sau liên kết với nhau bằng phép liên kết nào?\n"Lan rất thích đọc sách. Em thường dành một giờ mỗi tối để đọc truyện."',
        options: {
          A: 'Phép nối',
          B: 'Phép thế',
          C: 'Phép lặp từ ngữ',
          D: 'Phép trái nghĩa'
        },
        correctAnswer: 'B',
        explanation: 'Đại từ "Em" ở câu sau dùng để thay thế cho danh từ riêng "Lan" ở câu trước.'
      },
      {
        number: 13,
        question: 'Trong các từ sau, từ nào viết sai chính tả?',
        options: {
          A: 'Giành giật',
          B: 'Để dành',
          C: 'Tranh giành',
          D: 'Dành giật'
        },
        correctAnswer: 'D',
        explanation: 'Đúng chính tả là "giành giật" (nghĩa là cố lấy về mình).'
      },
      {
        number: 14,
        question: 'Cặp quan hệ từ "Tuy ... nhưng ..." biểu thị quan hệ gì giữa các vế câu?',
        options: {
          A: 'Nguyên nhân – kết quả',
          B: 'Điều kiện – kết quả',
          C: 'Tương phản',
          D: 'Tăng tiến'
        },
        correctAnswer: 'C',
        explanation: 'Cặp quan hệ từ "Tuy ... nhưng ..." biểu thị mối quan hệ tương phản giữa hai vế câu.'
      },
      {
        number: 15,
        question: 'Từ "xuân" trong câu thơ "Mùa xuân là Tết trồng cây / Làm cho đất nước càng ngày càng xuân" có hiện tượng gì?',
        options: {
          A: 'Từ đồng âm',
          B: 'Từ nhiều nghĩa (chuyển nghĩa)',
          C: 'Từ trái nghĩa',
          D: 'Từ mượn'
        },
        correctAnswer: 'B',
        explanation: '"Xuân" (1) chỉ mùa đầu tiên trong năm; "xuân" (2) mang nghĩa chuyển chỉ sự tươi trẻ, đầy sức sống.'
      },
      {
        number: 16,
        question: 'Dấu ngoặc kép trong câu: "Cô giáo khen: \'Bài viết của em hôm nay rất giàu cảm xúc!\'" dùng để làm gì?',
        options: {
          A: 'Đánh dấu phần giải thích',
          B: 'Dẫn lời nói trực tiếp của nhân vật',
          C: 'Ngăn cách các bộ phận cùng chức vụ',
          D: 'Đánh dấu câu cảm thán'
        },
        correctAnswer: 'B',
        explanation: 'Dấu ngoặc kép/nháy đơn sau dấu hai chấm ở đây dùng để dẫn trực tiếp lời khen của cô giáo.'
      },
      {
        number: 17,
        question: 'Từ nào dưới đây có tiếng "hữu" mang nghĩa là "bạn bè"?',
        options: {
          A: 'Hữu ích',
          B: 'Chiến hữu',
          C: 'Hữu hạn',
          D: 'Sở hữu'
        },
        correctAnswer: 'B',
        explanation: '"Chiến hữu" là bạn cùng chiến đấu; còn hữu ích/hữu hạn (có), sở hữu (nắm giữ).'
      },
      {
        number: 18,
        question: 'Câu nào dưới đây là câu ghép?',
        options: {
          A: 'Trên cành cao, những chú chim sơn ca đang hót líu lo.',
          B: 'Buổi sáng, sương mù giăng kín mặt hồ và phủ mờ lối đi.',
          C: 'Trời vừa hửng sáng, mẹ đã ra đồng gặt lúa.',
          D: 'Em và các bạn cùng nhau dọn vệ sinh sân trường.'
        },
        correctAnswer: 'C',
        explanation: 'Câu C có 2 cụm chủ-vị không bao chứa nhau: (1) Trời / vừa hửng sáng; (2) mẹ / đã ra đồng gặt lúa.'
      },
      {
        number: 19,
        question: 'Biện pháp nhân hóa được thể hiện rõ nhất ở câu nào sau đây?',
        options: {
          A: 'Mặt trời đỏ rực như một quả cầu lửa.',
          B: 'Bác giun đất cần mẫn cày xới từng tấc đất tơi xốp.',
          C: 'Dòng sông uốn lượn quanh co giữa cánh đồng xanh.',
          D: 'Tiếng suối chảy róc rách qua khe đá.'
        },
        correctAnswer: 'B',
        explanation: 'Gọi giun đất là "bác" và gán hành động "cần mẫn" của con người là biện pháp nhân hóa.'
      },
      {
        number: 20,
        question: 'Câu tục ngữ nào nói về tinh thần đoàn kết?',
        options: {
          A: 'Có công mài sắt, có ngày nên kim.',
          B: 'Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao.',
          C: 'Đi một ngày đàng, học một sàng khôn.',
          D: 'Đói cho sạch, rách cho thơm.'
        },
        correctAnswer: 'B',
        explanation: 'Câu tục ngữ khẳng định sức mạnh của sự gắn bó, đoàn kết tập thể.'
      }
    ],
    groups: [
      {
        id: 'group_1',
        title: 'Nhóm đọc hiểu 1 (Câu 21 – 25)',
        passageTitle: 'Buổi sớm trên đồi chè',
        passage:
          'Mỗi buổi sớm mai, khi màn sương mỏng còn bảng lảng trên triền đồi, cả không gian như chìm trong vẻ tĩnh lặng dịu êm. Từ phía đông, những tia nắng đầu tiên nhẹ nhàng xuyên qua kẽ lá, đánh thức từng búp chè non còn ngậm đầy sương sớm. Gió núi thổi qua mang theo hương chè thanh mát, quyện với mùi đất ẩm sau đêm dài.\n\nTrên con đường nhỏ uốn quanh sườn đồi, tiếng cười nói rộn ràng của các cô bác nông dân bắt đầu vang lên. Đôi bàn tay thoăn thoắt hái từng búp chè xanh mướt bỏ vào chiếc gùi sau lưng. Nắng lên cao dần, cả đồi chè bừng sáng như một bức tranh xanh biếc đầy sức sống, báo hiệu một ngày lao động mới bình yên và no ấm.',
        questions: [
          {
            number: 21,
            question: 'Đoạn văn trên miêu tả khung cảnh nào?',
            options: {
              A: 'Cảnh hoàng hôn trên biển',
              B: 'Cảnh buổi sớm trên đồi chè',
              C: 'Cảnh phiên chợ vùng cao ngày Tết',
              D: 'Cảnh cơn mưa rào mùa hạ'
            },
            correctAnswer: 'B',
            explanation: 'Toàn bộ đoạn văn tập trung tả cảnh thiên nhiên và con người vào buổi sớm trên đồi chè.'
          },
          {
            number: 22,
            question: 'Trong đoạn đầu, chi tiết nào cho thấy buổi sớm vẫn còn rất sớm và yên ả?',
            options: {
              A: 'Tiếng xe cộ chạy rộn ràng dưới thung lũng',
              B: 'Màn sương mỏng bảng lảng và không gian tĩnh lặng dịu êm',
              C: 'Ánh nắng gay gắt chiếu xuống mặt đất',
              D: 'Những đám mây đen kéo đến kín bầu trời'
            },
            correctAnswer: 'B',
            explanation: 'Câu mở đầu nêu rõ: "khi màn sương mỏng còn bảng lảng... cả không gian như chìm trong vẻ tĩnh lặng dịu êm".'
          },
          {
            number: 23,
            question: 'Cụm từ "đánh thức từng búp chè non" sử dụng biện pháp nghệ thuật gì?',
            options: {
              A: 'Nhân hóa',
              B: 'Nói quá',
              C: 'Điệp ngữ',
              D: 'Liệt kê'
            },
            correctAnswer: 'A',
            explanation: 'Tác giả dùng hành động của con người ("đánh thức") cho tia nắng và búp chè non.'
          },
          {
            number: 24,
            question: 'Hình ảnh người nông dân trong đoạn văn hiện lên với nét đẹp nào?',
            options: {
              A: 'Buồn bã, mệt mỏi trước công việc',
              B: 'Vui vẻ, chăm chỉ và nhanh nhẹn trong lao động',
              C: 'Vội vã tránh cơn bão lớn sắp tới',
              D: 'Đang nghỉ ngơi sau khi thu hoạch xong'
            },
            correctAnswer: 'B',
            explanation: 'Thể hiện qua chi tiết "tiếng cười nói rộn ràng", "đôi bàn tay thoăn thoắt hái từng búp chè".'
          },
          {
            number: 25,
            question: 'Từ "thanh mát" trong đoạn văn gợi cảm giác gì cho người đọc?',
            options: {
              A: 'Nặng nề, oi bức',
              B: 'Trong lành, dễ chịu và tươi mới',
              C: 'Lạnh buốt, giá rét',
              D: 'Nồng nặc, khó chịu'
            },
            correctAnswer: 'B',
            explanation: '"Hương chè thanh mát" gợi mùi thơm nhẹ nhàng, trong lành của thiên nhiên buổi sáng.'
          }
        ]
      },
      {
        id: 'group_2',
        title: 'Nhóm đọc hiểu 2 (Câu 26 – 30)',
        passageTitle: 'Sức mạnh của thói quen đọc sách',
        passage:
          'Trong nhịp sống hiện đại với nhiều thiết bị điện tử hấp dẫn, việc duy trì thói quen đọc sách giấy hoặc sách nói mỗi ngày mang lại giá trị vô cùng bền vững. Chỉ cần dành ra hai mươi phút trước khi đi ngủ để đọc vài trang sách, tâm trí chúng ta sẽ dần lắng lại, giảm bớt căng thẳng sau một ngày học tập và làm việc.\n\nKhông chỉ mở rộng vốn hiểu biết về thế giới xung quanh, đọc sách còn giúp người đọc rèn luyện khả năng tập trung, làm giàu vốn từ ngữ và nuôi dưỡng lòng đồng cảm. Mỗi cuốn sách hay giống như một người thầy thầm lặng, kiên nhẫn đồng hành cùng ta trên hành trình trưởng thành.',
        questions: [
          {
            number: 26,
            question: 'Theo đoạn văn, dành khoảng bao nhiêu thời gian mỗi ngày để đọc sách trước khi ngủ đã mang lại hiệu quả tích cực?',
            options: {
              A: '5 phút',
              B: '20 phút',
              C: '2 giờ',
              D: 'Cả buổi tối'
            },
            correctAnswer: 'B',
            explanation: 'Đoạn văn viết: "Chỉ cần dành ra hai mươi phút trước khi đi ngủ để đọc vài trang sách...".'
          },
          {
            number: 27,
            question: 'Lợi ích nào KHÔNG được nhắc đến trong văn bản trên?',
            options: {
              A: 'Giúp giảm bớt căng thẳng',
              B: 'Rèn luyện khả năng tập trung',
              C: 'Làm giàu vốn từ ngữ và lòng đồng cảm',
              D: 'Giúp tăng chiều cao nhanh chóng'
            },
            correctAnswer: 'D',
            explanation: 'Các phương án A, B, C đều được nêu trực tiếp trong bài; D không có trong văn bản.'
          },
          {
            number: 28,
            question: 'Tác giả đã ví mỗi cuốn sách hay như hình ảnh nào?',
            options: {
              A: 'Một ngọn hải đăng giữa biển khơi',
              B: 'Một người thầy thầm lặng',
              C: 'Một cánh cửa bằng vàng',
              D: 'Một dòng sông hiền hòa'
            },
            correctAnswer: 'B',
            explanation: 'Câu cuối viết: "Mỗi cuốn sách hay giống như một người thầy thầm lặng...".'
          },
          {
            number: 29,
            question: 'Từ "bền vững" trong đoạn văn có nghĩa gần nhất với từ nào?',
            options: {
              A: 'Tạm thời',
              B: 'Lâu dài, vững chắc',
              C: 'Nhanh chóng',
              D: 'Nhỏ bé'
            },
            correctAnswer: 'B',
            explanation: '"Bền vững" chỉ giá trị tồn tại lâu dài và chắc chắn theo thời gian.'
          },
          {
            number: 30,
            question: 'Thông điệp chính mà tác giả muốn gửi gắm qua đoạn văn là gì?',
            options: {
              A: 'Nên ngừng sử dụng hoàn toàn các thiết bị điện tử',
              B: 'Chỉ nên đọc sách vào dịp nghỉ hè',
              C: 'Hãy duy trì thói quen đọc sách mỗi ngày để hoàn thiện bản thân',
              D: 'Sách nói tốt hơn sách giấy rất nhiều'
            },
            correctAnswer: 'C',
            explanation: 'Đoạn văn khuyến khích duy trì thói quen đọc sách hằng ngày nhờ nhiều lợi ích về tinh thần và tri thức.'
          }
        ]
      }
    ]
  },
  {
    id: 'exam_tv_mau_02',
    title: 'Đề Đánh giá năng lực Tiếng Việt – Đề số 02',
    description:
      'Đề luyện tập nâng cao kỹ năng dùng từ, phát hiện lỗi sai ngữ pháp – logic và 2 bài đọc hiểu văn bản nghị luận & thông tin (Câu 21–30).',
    durationMinutes: 40,
    isPublished: true,
    createdAt: '2026-11-19T09:30:00.000Z',
    updatedAt: '2026-11-19T09:30:00.000Z',
    singleQuestions: [
      {
        number: 1,
        question: 'Chọn từ viết đúng chính tả để điền vào chỗ trống: "Anh ấy là người rất ... trong công việc."',
        options: {
          A: 'chỉnh chu',
          B: 'chỉn chu',
          C: 'chỉn tru',
          D: 'chỉnh tru'
        },
        correctAnswer: 'B',
        explanation: 'Từ đúng chính tả là "chỉn chu" (chu đáo, cẩn thận, không sơ suất).'
      },
      {
        number: 2,
        question: 'Câu nào dưới đây mắc lỗi dùng từ sai nghĩa?',
        options: {
          A: 'Nhà trường luôn đề cao tinh thần tự học của học sinh.',
          B: 'Bức tranh phong cảnh quê hương được vẽ rất sinh động.',
          C: 'Chúng ta cần khắc phục những điểm yếu để tiến bộ hơn.',
          D: 'Cô ấy có giọng hát rất truyền cảm và bàng quan.'
        },
        correctAnswer: 'D',
        explanation: '"Bàng quan" nghĩa là thờ ơ, đứng ngoài cuộc, không phù hợp để miêu tả giọng hát.'
      },
      {
        number: 3,
        question: 'Xác định lỗi sai trong câu: "Qua tác phẩm Tắt đèn đã cho thấy số phận bi thảm của người nông dân xưa."',
        options: {
          A: 'Thiếu chủ ngữ do dùng thừa quan hệ từ "Qua"',
          B: 'Thiếu vị ngữ',
          C: 'Sai dấu câu ở cuối câu',
          D: 'Dùng sai từ nối giữa hai vế'
        },
        correctAnswer: 'A',
        explanation: '"Qua tác phẩm Tắt đèn" là trạng ngữ, khiến câu thiếu chủ ngữ. Cần bỏ từ "Qua".'
      },
      {
        number: 4,
        question: 'Từ Hán Việt "nhân ái" có nghĩa là gì?',
        options: {
          A: 'Lòng yêu thương con người',
          B: 'Sự thông minh, sáng suốt',
          C: 'Tính kiên trì, nhẫn nại',
          D: 'Lòng dũng cảm trước khó khăn'
        },
        correctAnswer: 'A',
        explanation: '"Nhân" là người/lòng thương người, "ái" là yêu thương.'
      },
      {
        number: 5,
        question: 'Trong các từ sau, từ nào KHÔNG phải là từ láy?',
        options: {
          A: 'Mênh mông',
          B: 'Rì rào',
          C: 'Tươi tốt',
          D: 'Long lanh'
        },
        correctAnswer: 'C',
        explanation: '"Tươi tốt" là từ ghép đẳng lập (tươi + tốt), hai tiếng đều có nghĩa.'
      },
      {
        number: 6,
        question: 'Cặp từ nào dưới đây là cặp từ trái nghĩa?',
        options: {
          A: 'Khiêm tốn – giản dị',
          B: 'Thận trọng – liều lĩnh',
          C: 'Trung thực – thật thà',
          D: 'Đoàn kết – gắn bó'
        },
        correctAnswer: 'B',
        explanation: '"Thận trọng" (cẩn thận, cân nhắc kỹ) trái nghĩa với "liều lĩnh" (làm bừa không ngại nguy hiểm).'
      },
      {
        number: 7,
        question: 'Biện pháp tu từ nào nổi bật trong hai câu thơ:\n"Mặt trời của bắp thì nằm trên đồi / Mặt trời của mẹ, em nằm trên lưng."',
        options: {
          A: 'Ẩn dụ',
          B: 'Nói quá',
          C: 'Hoán dụ',
          D: 'Đảo ngữ'
        },
        correctAnswer: 'A',
        explanation: '"Mặt trời của mẹ" là hình ảnh ẩn dụ chỉ người con – nguồn sáng, niềm tin và hy vọng của mẹ.'
      },
      {
        number: 8,
        question: 'Dòng nào dưới đây có sự sắp xếp các từ theo trình tự tăng dần về mức độ?',
        options: {
          A: 'Thích, say mê, yêu quý',
          B: 'Mưa phùn, mưa rào, mưa bão',
          C: 'Lạnh buốt, se lạnh, mát mẻ',
          D: 'Vui sướng, hài lòng, hạnh phúc'
        },
        correctAnswer: 'B',
        explanation: 'Mức độ mưa tăng dần từ nhẹ (mưa phùn) -> vừa/to (mưa rào) -> dữ dội (mưa bão).'
      },
      {
        number: 9,
        question: 'Câu: "Dù trời mưa to nhưng Nam vẫn đến lớp đúng giờ." mắc lỗi gì?',
        options: {
          A: 'Không mắc lỗi, câu đúng chuẩn ngữ pháp',
          B: 'Thiếu thành phần chủ ngữ',
          C: 'Dùng sai dấu phẩy',
          D: 'Sai nghĩa từ "đúng giờ"'
        },
        correctAnswer: 'A',
        explanation: 'Cặp quan hệ từ "Dù ... nhưng ..." biểu thị quan hệ tương phản hoàn toàn đúng ngữ pháp.'
      },
      {
        number: 10,
        question: 'Từ "chín" trong câu nào mang nghĩa chuyển?',
        options: {
          A: 'Vườn cam năm nay quả đã chín vàng.',
          B: 'Nồi cơm đã chín, tỏa mùi thơm phức.',
          C: 'Trước khi quyết định, bạn cần suy nghĩ cho thật chín.',
          D: 'Quả chuối chín có vị ngọt đậm.'
        },
        correctAnswer: 'C',
        explanation: '"Suy nghĩ cho thật chín" nghĩa là suy nghĩ kỹ càng, thấu đáo (nghĩa chuyển).'
      },
      {
        number: 11,
        question: 'Thành ngữ "Nước đổ đầu vịt" dùng để chỉ điều gì?',
        options: {
          A: 'Cảnh thiên nhiên vùng sông nước thanh bình',
          B: 'Nói mãi, khuyên bảo mãi mà người nghe không tiếp thu',
          C: 'Sự nhanh nhẹn, tháo vát trong công việc',
          D: 'Tình cảm gắn bó keo sơn giữa bạn bè'
        },
        correctAnswer: 'B',
        explanation: 'Thành ngữ ví sự không tiếp thu lời khuyên như nước đổ lên lông vịt không thấm.'
      },
      {
        number: 12,
        question: 'Trong câu "Trên bầu trời cao rộng, đàn chim én chao lượn báo hiệu mùa xuân về.", cụm từ "Trên bầu trời cao rộng" giữ chức vụ gì?',
        options: {
          A: 'Chủ ngữ',
          B: 'Vị ngữ',
          C: 'Trạng ngữ chỉ nơi chốn',
          D: 'Bổ ngữ'
        },
        correctAnswer: 'C',
        explanation: 'Cụm từ đứng đầu câu chỉ địa điểm diễn ra sự việc nên là trạng ngữ chỉ nơi chốn.'
      },
      {
        number: 13,
        question: 'Cách dùng dấu hai chấm trong câu: "Chủ đề buổi thảo luận gồm ba nội dung chính: bảo vệ môi trường, tiết kiệm điện và phân loại rác." có tác dụng gì?',
        options: {
          A: 'Báo hiệu phần liệt kê, giải thích đứng sau',
          B: 'Dẫn lời nói trực tiếp của nhân vật',
          C: 'Thể hiện cảm xúc ngạc nhiên',
          D: 'Ngăn cách các vế trong câu ghép'
        },
        correctAnswer: 'A',
        explanation: 'Dấu hai chấm mở ra phần liệt kê ba nội dung chính.'
      },
      {
        number: 14,
        question: 'Từ nào viết đúng chính tả trong các phương án sau?',
        options: {
          A: 'Lãng mạng',
          B: 'Lãng mạn',
          C: 'Lãn mạn',
          D: 'Lảng mạn'
        },
        correctAnswer: 'B',
        explanation: 'Viết đúng chính tả tiếng Việt là "lãng mạn".'
      },
      {
        number: 15,
        question: 'Trong đoạn văn: "Hà Nội bước vào thu. Tiết trời dịu nhẹ, thoang thoảng hương hoa sữa.", câu thứ hai liên kết với câu thứ nhất chủ yếu bằng phép nào?',
        options: {
          A: 'Phép liên tưởng',
          B: 'Phép lặp từ ngữ',
          C: 'Phép nối bằng quan hệ từ',
          D: 'Phép trái nghĩa'
        },
        correctAnswer: 'A',
        explanation: '"Tiết trời dịu nhẹ, hương hoa sữa" là những hình ảnh đặc trưng gắn liền với "mùa thu Hà Nội" (phép liên tưởng).'
      },
      {
        number: 16,
        question: 'Câu nào dưới đây là câu đơn?',
        options: {
          A: 'Nếu trời nắng đẹp, cả lớp sẽ đi tham quan bảo tàng.',
          B: 'Mặt trời lên cao, sương tan dần trên mặt hồ.',
          C: 'Những bông hoa hướng dương rực rỡ vươn mình đón ánh nắng ban mai.',
          D: 'Mẹ nấu cơm còn bố dọn dẹp lại góc học tập.'
        },
        correctAnswer: 'C',
        explanation: 'Câu C chỉ có một cụm chủ-vị nòng cốt: Những bông hoa hướng dương rực rỡ / vươn mình đón ánh nắng ban mai.'
      },
      {
        number: 17,
        question: 'Chọn từ thích hợp nhất điền vào chỗ trống: "Lối diễn đạt ... giúp bài văn nghị luận trở nên thuyết phục hơn."',
        options: {
          A: 'mạch lạc',
          B: 'rời rạc',
          C: 'mơ hồ',
          D: 'lan man'
        },
        correctAnswer: 'A',
        explanation: '"Mạch lạc" nghĩa là rõ ràng, liên kết chặt chẽ và hợp lý.'
      },
      {
        number: 18,
        question: 'Câu thơ "Bàn tay ta làm nên tất cả / Có sức người sỏi đá cũng thành cơm" sử dụng biện pháp tu từ nào là chủ yếu?',
        options: {
          A: 'Nói quá (phóng đại) kết hợp hoán dụ',
          B: 'So sánh',
          C: 'Chơi chữ',
          D: 'Điệp thanh'
        },
        correctAnswer: 'A',
        explanation: '"Bàn tay" hoán dụ chỉ người lao động; "sỏi đá cũng thành cơm" là cách nói quá nhằm đề cao sức lao động.'
      },
      {
        number: 19,
        question: 'Từ nào dưới đây có tiếng "quốc" KHÔNG mang nghĩa là "đất nước / nhà nước"?',
        options: {
          A: 'Quốc kỳ',
          B: 'Quốc ca',
          C: 'Quốc gia',
          D: 'Tất cả đều mang nghĩa đất nước / nhà nước'
        },
        correctAnswer: 'D',
        explanation: 'Quốc kỳ (cờ nước), quốc ca (bài hát chính thức của nước), quốc gia (đất nước) đều có tiếng "quốc" là nước.'
      },
      {
        number: 20,
        question: 'Đọc câu: "Cây bàng cổ thụ đứng sừng sững giữa sân trường như một người bảo vệ thầm lặng." Câu văn có mấy từ láy?',
        options: {
          A: '1 từ (sừng sững)',
          B: '2 từ (cổ thụ, sừng sững)',
          C: '2 từ (sừng sững, thầm lặng)',
          D: '3 từ (cổ thụ, sừng sững, thầm lặng)'
        },
        correctAnswer: 'A',
        explanation: 'Chỉ có "sừng sững" là từ láy; "cổ thụ" và "thầm lặng" là từ ghép.'
      }
    ],
    groups: [
      {
        id: 'group_1',
        title: 'Nhóm đọc hiểu 1 (Câu 21 – 25)',
        passageTitle: 'Giá trị của lời xin lỗi chân thành',
        passage:
          'Trong giao tiếp hằng ngày, không ai tránh khỏi những lúc sơ suất làm phiền hoặc gây tổn thương cho người khác. Khi nhận ra lỗi lầm, một lời xin lỗi kịp thời và chân thành chính là chiếc cầu nối giúp hóa giải hiểu lầm, giữ gìn sự tôn trọng lẫn nhau.\n\nTuy nhiên, lời xin lỗi chỉ thực sự có giá trị khi đi kèm với thái độ cầu thị và hành động sửa sai cụ thể. Nếu chỉ nói "xin lỗi" cho xong chuyện rồi tiếp tục lặp lại sai sót cũ, niềm tin giữa người với người sẽ dần phai nhạt. Biết nhận lỗi không phải là biểu hiện của sự yếu đuối, mà là dấu hiệu của bản lĩnh và lòng tự trọng.',
        questions: [
          {
            number: 21,
            question: 'Theo đoạn văn, lời xin lỗi kịp thời và chân thành có vai trò gì?',
            options: {
              A: 'Giúp chứng tỏ bản thân luôn đúng',
              B: 'Giúp hóa giải hiểu lầm và giữ gìn sự tôn trọng lẫn nhau',
              C: 'Giúp người khác quên ngay mọi trách nhiệm',
              D: 'Giúp tránh phải sửa chữa sai sót'
            },
            correctAnswer: 'B',
            explanation: 'Đoạn đầu nêu rõ lời xin lỗi là chiếc cầu nối giúp hóa giải hiểu lầm, giữ gìn sự tôn trọng.'
          },
          {
            number: 22,
            question: 'Điều kiện để lời xin lỗi thực sự có giá trị là gì?',
            options: {
              A: 'Phải nói trước đám đông thật lớn',
              B: 'Phải đi kèm thái độ cầu thị và hành động sửa sai cụ thể',
              C: 'Chỉ cần gửi một tin nhắn ngắn gọn',
              D: 'Phải chờ thật lâu mới nói'
            },
            correctAnswer: 'B',
            explanation: 'Đoạn hai viết: "lời xin lỗi chỉ thực sự có giá trị khi đi kèm với thái độ cầu thị và hành động sửa sai cụ thể".'
          },
          {
            number: 23,
            question: 'Điều gì xảy ra nếu nói xin lỗi qua loa nhưng vẫn lặp lại lỗi cũ?',
            options: {
              A: 'Mọi người sẽ càng yêu quý hơn',
              B: 'Niềm tin giữa người với người sẽ dần phai nhạt',
              C: 'Sai sót sẽ tự động biến mất',
              D: 'Không ảnh hưởng đến các mối quan hệ'
            },
            correctAnswer: 'B',
            explanation: 'Tác giả cảnh báo niềm tin giữa người với người sẽ dần phai nhạt nếu lặp lại sai sót cũ.'
          },
          {
            number: 24,
            question: 'Theo tác giả, việc biết nhận lỗi thể hiện phẩm chất nào?',
            options: {
              A: 'Sự yếu đuối và tự ti',
              B: 'Sự nóng nảy và bảo thủ',
              C: 'Bản lĩnh và lòng tự trọng',
              D: 'Sự phụ thuộc vào người khác'
            },
            correctAnswer: 'C',
            explanation: 'Câu cuối khẳng định: "Biết nhận lỗi... là dấu hiệu của bản lĩnh và lòng tự trọng."'
          },
          {
            number: 25,
            question: 'Phong cách ngôn ngữ chính của đoạn văn trên là gì?',
            options: {
              A: 'Nghệ thuật (truyện ngắn)',
              B: 'Nghị luận xã hội',
              C: 'Hành chính – công vụ',
              D: 'Khoa học tự nhiên'
            },
            correctAnswer: 'B',
            explanation: 'Đoạn văn bàn luận, nêu quan điểm về một vấn đề đạo đức – lối sống (nghị luận xã hội).'
          }
        ]
      },
      {
        id: 'group_2',
        title: 'Nhóm đọc hiểu 2 (Câu 26 – 30)',
        passageTitle: 'Rừng ngập mặn – "Bức tường xanh" bảo vệ vùng ven biển',
        passage:
          'Rừng ngập mặn phát triển dọc theo các vùng cửa sông, bãi bồi ven biển nhiệt đới. Với hệ rễ chằng chịt cắm sâu xuống lớp bùn lầy, cây đước, cây mắm và cây vẹt có khả năng làm giảm đáng kể sức tàn phá của sóng lớn, triều cường và gió bão đối với đê điều cũng như khu dân cư.\n\nBên cạnh vai trò chắn sóng, rừng ngập mặn còn là "ngôi nhà chung" giàu dinh dưỡng cho nhiều loài tôm, cua, cá và chim nước sinh trưởng. Theo các nhà khoa học, mỗi héc-ta rừng ngập mặn còn hấp thụ lượng khí cacbonic lớn hơn nhiều so với rừng trên cạn, góp phần tích cực vào việc ứng phó với biến đổi khí hậu toàn cầu.',
        questions: [
          {
            number: 26,
            question: 'Rừng ngập mặn thường phân bố ở khu vực nào?',
            options: {
              A: 'Trên các đỉnh núi cao quanh năm mây phủ',
              B: 'Dọc theo vùng cửa sông, bãi bồi ven biển nhiệt đới',
              C: 'Giữa các vùng sa mạc khô hạn',
              D: 'Trong các hang động đá vôi'
            },
            correctAnswer: 'B',
            explanation: 'Câu đầu tiên cho biết rừng ngập mặn phát triển dọc theo các vùng cửa sông, bãi bồi ven biển nhiệt đới.'
          },
          {
            number: 27,
            question: 'Nhờ đặc điểm nào mà cây ngập mặn giúp giảm sức tàn phá của sóng lớn và gió bão?',
            options: {
              A: 'Thân cây rất cao và lá rụng hết vào mùa mưa',
              B: 'Hệ rễ chằng chịt cắm sâu xuống lớp bùn lầy',
              C: 'Hoa nở quanh năm thu hút côn trùng',
              D: 'Vỏ cây có màu trắng phản chiếu ánh nắng'
            },
            correctAnswer: 'B',
            explanation: 'Đoạn văn nêu rõ nhờ "hệ rễ chằng chịt cắm sâu xuống lớp bùn lầy".'
          },
          {
            number: 28,
            question: 'Cụm từ "ngôi nhà chung" trong đoạn hai nói về vai trò nào của rừng ngập mặn?',
            options: {
              A: 'Nơi cung cấp vật liệu xây dựng nhà ở',
              B: 'Môi trường sống giàu dinh dưỡng cho nhiều loài thủy sản và chim nước',
              C: 'Khu vui chơi giải trí trên biển',
              D: 'Nơi neo đậu tàu thuyền đánh cá lớn'
            },
            correctAnswer: 'B',
            explanation: 'Rừng ngập mặn là nơi sinh trưởng giàu dinh dưỡng cho tôm, cua, cá và chim nước.'
          },
          {
            number: 29,
            question: 'Theo các nhà khoa học, lợi ích nổi bật của rừng ngập mặn đối với khí hậu là gì?',
            options: {
              A: 'Làm tăng nhiệt độ nước biển vào mùa đông',
              B: 'Hấp thụ lượng khí cacbonic lớn, góp phần ứng phó biến đổi khí hậu',
              C: 'Ngăn hoàn toàn lượng mưa rơi xuống đất liền',
              D: 'Tạo ra nhiều mỏ khoáng sản quý'
            },
            correctAnswer: 'B',
            explanation: 'Câu cuối nêu rõ khả năng hấp thụ khí cacbonic lớn hơn nhiều so với rừng trên cạn.'
          },
          {
            number: 30,
            question: 'Nhan đề của văn bản gọi rừng ngập mặn là "Bức tường xanh" nhằm nhấn mạnh điều gì?',
            options: {
              A: 'Màu sắc đồng nhất của nước biển',
              B: 'Vai trò che chắn, bảo vệ tự nhiên vững chắc cho vùng ven biển',
              C: 'Chi phí trồng rừng rất tốn kém',
              D: 'Hình dáng thẳng đứng của các vách đá'
            },
            correctAnswer: 'B',
            explanation: '"Bức tường xanh" nhấn mạnh chức năng chắn sóng, chắn gió, bảo vệ đê điều và dân cư ven biển.'
          }
        ]
      }
    ]
  }
];

function buildSampleAnswers(exam, wrongMap) {
  const answers = {};
  const all = [
    ...exam.singleQuestions,
    ...exam.groups[0].questions,
    ...exam.groups[1].questions
  ];
  all.forEach((q) => {
    const key = String(q.number);
    answers[key] = wrongMap[key] || q.correctAnswer;
  });
  return answers;
}

const exam1 = SAMPLE_EXAMS[0];
const exam2 = SAMPLE_EXAMS[1];

export const SAMPLE_SUBMISSIONS = [
  {
    id: 'sub_demo_01',
    examId: exam1.id,
    examTitle: exam1.title,
    studentName: 'Nguyễn Minh Anh',
    studentClass: '9A1',
    correctCount: 28,
    totalQuestions: 30,
    score: 9.33,
    elapsedSeconds: 1420,
    answers: buildSampleAnswers(exam1, { '13': 'A', '24': 'C' }),
    submittedAt: '2026-11-19T08:45:00.000Z'
  },
  {
    id: 'sub_demo_02',
    examId: exam1.id,
    examTitle: exam1.title,
    studentName: 'Trần Gia Bảo',
    studentClass: '9A1',
    correctCount: 24,
    totalQuestions: 30,
    score: 8,
    elapsedSeconds: 1685,
    answers: buildSampleAnswers(exam1, {
      '3': 'B',
      '12': 'C',
      '13': 'A',
      '17': 'A',
      '23': 'C',
      '28': 'A'
    }),
    submittedAt: '2026-11-19T09:10:00.000Z'
  },
  {
    id: 'sub_demo_03',
    examId: exam1.id,
    examTitle: exam1.title,
    studentName: 'Lê Thảo Vy',
    studentClass: '9A2',
    correctCount: 22,
    totalQuestions: 30,
    score: 7.33,
    elapsedSeconds: 1910,
    answers: buildSampleAnswers(exam1, {
      '1': 'B',
      '7': 'A',
      '12': 'A',
      '13': 'C',
      '15': 'A',
      '18': 'B',
      '23': 'D',
      '29': 'A'
    }),
    submittedAt: '2026-11-19T09:40:00.000Z'
  },
  {
    id: 'sub_demo_04',
    examId: exam2.id,
    examTitle: exam2.title,
    studentName: 'Phạm Quốc Huy',
    studentClass: '9A2',
    correctCount: 20,
    totalQuestions: 30,
    score: 6.67,
    elapsedSeconds: 2050,
    answers: buildSampleAnswers(exam2, {
      '2': 'A',
      '3': 'B',
      '5': 'A',
      '7': 'C',
      '10': 'A',
      '15': 'B',
      '18': 'B',
      '20': 'C',
      '25': 'A',
      '30': 'A'
    }),
    submittedAt: '2026-11-19T10:15:00.000Z'
  },
  {
    id: 'sub_demo_05',
    examId: exam2.id,
    examTitle: exam2.title,
    studentName: 'Võ Ngọc Hân',
    studentClass: '9A3',
    correctCount: 15,
    totalQuestions: 30,
    score: 5,
    elapsedSeconds: 2280,
    answers: buildSampleAnswers(exam2, {
      '1': 'A',
      '3': 'B',
      '4': 'B',
      '5': 'B',
      '8': 'A',
      '10': 'B',
      '11': 'C',
      '14': 'A',
      '15': 'B',
      '16': 'A',
      '18': 'B',
      '20': 'B',
      '22': 'A',
      '25': 'A',
      '29': 'A'
    }),
    submittedAt: '2026-11-19T10:50:00.000Z'
  }
];
