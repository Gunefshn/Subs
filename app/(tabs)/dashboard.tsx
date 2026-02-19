import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import React ,{useState} from 'react'; //Dinamik alanlar için useState
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, Entypo, Feather, FontAwesome5, Fontisto, Foundation, Ionicons, MaterialIcons } from '@expo/vector-icons'; //İkon kullanımı için
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import TransactionCard from "../components/TransactionCard"; 
import { Link } from "expo-router";



const Index = () => {
   
  //Kullanıcı adı dinamik 
  const [kullaniciAdi, setKullaniciAdi] = useState("ZEYNEP ECE");

  {/*Alt satırdaki dinamik bakiye alanı*/}
  const BalanceCard = () => {
  const [bakiye, setBakiye] = useState(1539.25); //tasarımdaki değer
  

  return (
    <View>
      <Text className="text-3xl font-semibold mt-6 px-4 text-black">
        ₺{bakiye}
      </Text>
    </View>
    );
  };

  const [gelir, setGelir] = useState(10170.00);
  const [gider, setGider] = useState(8630.75);


  const IncomeExpense = ({gelir ,gider}) => {
  return (
    <View className="flex-row justify-between mt-8">
      <View>
        <Text className="text-gray-500 font-semibold px-4">
          <Feather name="arrow-up-right" size={30} color="#16a34a" />
          Gelir{": "}
          <Text className="text-black font-bold">
            ₺{gelir}
          </Text>
        </Text>
    </View>

      <View>
        <Text className="text-gray-500 font-semibold px-4">
          <Feather name="arrow-down-right" size={30} color="#dc2626" />
          Gider{": "}
          <Text className="text-black font-bold">
            ₺{gider}
          </Text>
        </Text>
      </View>
    </View>
  );
};


   {/*Harcama değişimi kutusu dinamik oluşturuldu.*/}
   const InfoBox = ({ percent, isIncrease }) => {
   return (
    <View className="bg-white rounded-2xl p-4 mt-6 w-5/6 self-center">
      <View className="flex-row items-center px-4 mt-1 ">
        <Fontisto
          name="info"
          size={20}
          color={isIncrease ? "green" : "red"}
          style={{ marginRight: 6 }}
        />
        <Text className="text-lg font-semibold text-gray-500">
          Harcamaların geçen aya göre %{percent} {isIncrease ? "arttı" : "azaldı"}.
        </Text>
      </View>
    </View>
  );  
};

const transactions = [
  { name: "Macrocenter", icon: "shopping-cart", color: "green", amount: "₺783.50", date: "28.01.2026", category: "Market" },
  { name: "HBO Max", icon: "tv", color: "red", amount: "₺229.90", date: "24.01.2026", category: "Dijital Servis" },
  { name: "Pure Gym", icon: "dribbble", color: "orange", amount: "₺1150.00", date: "23.01.2026", category: "Spor" },
  { name: "İSKİ", icon: "drop", color: "blue", amount: "₺345.25", date: "19.01.2026", category: "Fatura" },
  { name: "Gail’s Bakery", icon: "shop", color: "orange", amount: "£240.00", date: "17.01.2026", category: "Yemek" },
];


  return (
      
      
      <SafeAreaView >
        
        {/*Text statik */}
        <Text className="self-center mt-10 text-2xl font-semibold text-black">
          Merhaba {kullaniciAdi}
        </Text>

        {/*En üstteki ana kutu ve içeriği*/}
        <View className="bg-white rounded-2xl p-4 mt-6 w-5/6 h-60 self-center ">
          <View className="flex-row justify-between items-center">
          
          {/*Sol tarafta text olarak başlık */}
          <Text className="text-lg font-semibold mt-3 px-4 text-gray-500">
           Toplam Bakiye
          </Text>

          {/*Sağ tarafta buton */}
          <TouchableOpacity className="bg-gray-100 mt-3 px-5 py-1 rounded-xl">
            <Text className="text-sm font-semibold text-gray-600">
            TRY
            </Text>
          </TouchableOpacity>

          </View>

          {/*Dinamik bakiye alanı*/}
          <BalanceCard/>

          {/*Dinamik gelir-gider alanları*/}
          <IncomeExpense gelir={gelir} gider={gider} />
        </View>



        {/*Dinamik infobox kutusu, artış-azalış gösteriyor.*/}   
        <InfoBox percent={2} isIncrease={true} />
           

      {/*Son İşlemler*/}
      <View className="flex-row justify-between items-center px-12 mt-6">
      <Text className="text-lg font-semibold text-black">Son İşlemler</Text>
        <Link href="/screens/allTransactions" asChild>
         <TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-500">Tümünü Gör</Text>
         </TouchableOpacity>
        </Link>
      </View>

      {/*Kartların listesi*/}
      <ScrollView className="mt-4"> 
        {/*Tüm işlemlerden 5 elemanı alıyor.*/}
        {transactions.slice(0, 5).map((item, index) => (
          <TransactionCard
            key={index}
            name={item.name}
            icon={item.icon}
            color={item.color}
            amount={item.amount}
            date={item.date}
            category={item.category}          />
        ))}
      </ScrollView>












        



      
      
      
      
      
      
      
      
      </SafeAreaView>

      
    
  );  
};




export default Index;




