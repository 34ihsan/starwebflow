export interface PoolTemplate {
  subject: string;
  body: string;
  day: number;
}

export interface SectorPool {
  id: string;
  name: string;
  templates: PoolTemplate[];
}

export const EMAIL_POOL: SectorPool[] = [
  {
    id: "health",
    name: "Sağlık & Estetik",
    templates: [
      {
        day: 1,
        subject: "{Company} için yeni hasta kazanım maliyetleri hk.",
        body: `Merhaba {Name},

Kısaca konuya gireceğim: Sağlık turizmi ve yerel hasta kazanımında kliniklerin Meta/Google reklam maliyetlerinin çok arttığını biliyoruz. Biz, sadece reklam vererek değil, yapay zeka destekli otonom sistemlerle potansiyel hastaları anında randevuya çevirerek bu maliyetleri ciddi şekilde düşürüyoruz.

Sizin için de benzer bir yapı kurgulayıp kurgulayamayacağımızı görmek adına önümüzdeki hafta 10 dakikalık kısa bir online tanışma yapabilir miyiz?

İyi çalışmalar dilerim.`,
      },
      {
        day: 3,
        subject: "Hasta kazanım maliyetlerini %40 düşüren sistem",
        body: `Merhaba {Name},

İlk e-postama henüz dönüş yapmadınız ancak {Company} için potansiyel gördüğümden bazı detayları paylaşmak istedim.

Sizinle aynı sektörde olan bir müşterimiz sadece temel randevu otomasyonuna geçişiyle hasta başvuru maliyetlerini %40 düşürdü. Nasıl yaptığımızı anlattığımız 2 dakikalık vaka çalışmasına göz atmak ister misiniz?

Vaktiniz olduğunda geri dönüşünüzü bekliyorum.`,
      },
      {
        day: 7,
        subject: "Klinik büyütmenin yeni kuralı",
        body: `Merhaba {Name},

Bu süreçte edindiğimiz ilginç bir bulguyu paylaşmak istedim. İncelediğimiz kliniklerin %80'i, potansiyel hastalara 5 dakikadan geç dönüş yaptığı için bu hastaları rakiplerine kaptırıyor. Otonom mesajlaşma ve randevu asistanları bu sorunu sıfıra indiriyor.

İlginizi çekiyorsa, bu sistemi sizin kliniğinize nasıl entegre edebileceğimizi konuşalım.`,
      },
      {
        day: 12,
        subject: "Doğru zaman değil mi?",
        body: `Merhaba {Name},

Birkaç kez iletişime geçtim ama sanırım şu an {Company} için yeni hasta kazanım sistemlerini yenilemenin doğru zamanı değil veya mesajlarım size ulaşmadı.

Eğer konuyu rafa kaldırdıysanız bana kısa bir "hayır" yanıtı verebilir misiniz? Böylece sizi daha fazla rahatsız etmem.`,
      },
      {
        day: 20,
        subject: "Yollarımızı ayırıyoruz",
        body: `Merhaba {Name},

Görünüşe göre şu an bir iş birliği için doğru zaman değil. Ben takiplerimi burada sonlandırıyorum. 

İleride hasta kazanım süreçlerinizi otonomlaştırmak veya dönüşüm oranlarınızı artırmak isterseniz bana her zaman bu mail üzerinden ulaşabilirsiniz.

İyi çalışmalar ve başarılar dilerim.`,
      }
    ]
  },
  {
    id: "real_estate",
    name: "Emlak & Gayrimenkul",
    templates: [
      {
        day: 1,
        subject: "{Company} portföy pazarlama süreçleri hk.",
        body: `Merhaba {Name},

Kısaca konuya gireceğim: Gayrimenkul sektöründe sıcak lead'lere (potansiyel alıcılara) anında dönüş yapmanın satış kapama oranlarını nasıl artırdığını biliyoruz. Biz, gayrimenkul ofisleri için WhatsApp otonom sistemleri kurarak 7/24 portföy sunumu ve randevu organizasyonu sağlıyoruz.

Sizin için de benzer bir yapı kurgulayıp kurgulayamayacağımızı görmek adına önümüzdeki hafta 10 dakikalık kısa bir online tanışma yapabilir miyiz?

İyi çalışmalar dilerim.`,
      },
      {
        day: 3,
        subject: "Satışa dönen lead oranını %35 artırmak",
        body: `Merhaba {Name},

İlk e-postama henüz dönüş yapmadınız ancak {Company} için potansiyel gördüğümden bazı detayları paylaşmak istedim.

Birlikte çalıştığımız bir emlak ofisi, hafta sonu gelen lead'leri otomatik karşılayan ve ön eleme yapan sistemimiz sayesinde sıcak satışa dönme oranını %35 artırdı.

Bu sistemi nasıl kurduğumuzu anlattığım kısa bir dökümanı sizinle paylaşmamı ister misiniz?`,
      },
      {
        day: 7,
        subject: "Emlak sektöründe hızın önemi",
        body: `Merhaba {Name},

Gayrimenkul alıcıları formu doldurduktan sonra ilk 5 dakika içinde aranmadıklarında veya mesaj almadıklarında ilgileri hızla düşüyor. Otonom mesajlaşma altyapıları, siz sahada ev gösterirken bile yeni müşterilerle ilgilenmeye devam eder.

Bu yapıyı ofisinize nasıl entegre edebileceğimizi konuşmak ister misiniz?`,
      },
      {
        day: 12,
        subject: "Doğru zaman değil mi?",
        body: `Merhaba {Name},

Birkaç kez iletişime geçtim ama sanırım şu an {Company} için teknolojik altyapıyı yenilemenin doğru zamanı değil.

Eğer konuyu rafa kaldırdıysanız bana kısa bir "hayır" yanıtı verebilir misiniz? Böylece sizi daha fazla takip listemde tutmam.`,
      },
      {
        day: 20,
        subject: "Yollarımızı ayırıyoruz",
        body: `Merhaba {Name},

Görünüşe göre şu an bir iş birliği için doğru zaman değil. Takiplerimi burada sonlandırıyorum. 

İleride emlak satış süreçlerinizi otonomlaştırmak veya daha fazla nitelikli lead yönetmek isterseniz bana her zaman bu mail üzerinden ulaşabilirsiniz.

İyi çalışmalar dilerim.`,
      }
    ]
  }
];

export const MASTER_BLUEPRINT = {
  day1: {
    subject: "{Company} için {VALUE_PROPOSITION} hk.",
    body: `Merhaba {Name},

Kısaca konuya gireceğim: {SECTOR_CONTEXT} alanında {PAIN_POINT} sorununu çözmenin giderek zorlaştığını biliyoruz. Biz, {SOLUTION_DESCRIPTION} sağlayarak firmaların {DESIRED_OUTCOME} elde etmelerini sağlıyoruz.

Sizin için de benzer bir yapı kurgulayıp kurgulayamayacağımızı görmek adına önümüzdeki hafta 10 dakikalık kısa bir online tanışma yapabilir miyiz?

İyi çalışmalar dilerim.`
  },
  day3: {
    subject: "{CASE_STUDY_METRIC} başarısı",
    body: `Merhaba {Name},

İlk e-postama henüz dönüş yapmadınız ancak {Company} için potansiyel gördüğümden bazı detayları paylaşmak istedim.

Sizinle aynı sektörde olan bir müşterimiz sadece temel sistem geçişiyle {CASE_STUDY_METRIC} sağladı. Nasıl yaptığımızı anlattığımız 2 dakikalık vaka çalışmasına göz atmak ister misiniz?

Vaktiniz olduğunda geri dönüşünüzü bekliyorum.`
  },
  day7: {
    subject: "Büyümenin yeni kuralı",
    body: `Merhaba {Name},

Bu süreçte edindiğimiz ilginç bir bulguyu paylaşmak istedim. İncelediğimiz firmaların %80'i, {COMMON_MISTAKE} nedeniyle rekabette geride kalıyor. {SOLUTION_NAME} altyapımız bu sorunu sıfıra indiriyor.

İlginizi çekiyorsa, bu sistemi firmanıza nasıl entegre edebileceğimizi konuşalım.`
  },
  day12: {
    subject: "Doğru zaman değil mi?",
    body: `Merhaba {Name},

Birkaç kez iletişime geçtim ama sanırım şu an {Company} için sistemleri yenilemenin doğru zamanı değil veya mesajlarım size ulaşmadı.

Eğer konuyu rafa kaldırdıysanız bana kısa bir "hayır" yanıtı verebilir misiniz? Böylece sizi daha fazla rahatsız etmem.`
  },
  day20: {
    subject: "Yollarımızı ayırıyoruz",
    body: `Merhaba {Name},

Görünüşe göre şu an bir iş birliği için doğru zaman değil. Ben takiplerimi burada sonlandırıyorum. 

İleride {DESIRED_OUTCOME} hedeflerinize ulaşmak isterseniz bana her zaman bu mail üzerinden ulaşabilirsiniz.

İyi çalışmalar ve başarılar dilerim.`
  }
};

